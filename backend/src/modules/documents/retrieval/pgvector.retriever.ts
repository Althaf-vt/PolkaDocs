import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Retriever, RetrieveParams } from './retriever.interface';
import { DocumentChunkRepository } from '../repositories/document-chunk.repository';
import { EMBEDDING_PROVIDER, type EmbeddingProvider } from '../../llm/interfaces/embedding-provider.interface';
import { RetrievedChunk } from '../interfaces/retrieved-chunk.interface';

@Injectable()
export class PgvectorRetriever implements Retriever {
    private readonly logger = new Logger(PgvectorRetriever.name);
    private readonly defaultTopK: number;
    private readonly defaultMinScore: number;

    constructor(
        @Inject(EMBEDDING_PROVIDER)
        private readonly embeddingProvider: EmbeddingProvider,
        private readonly documentChunkRepository: DocumentChunkRepository,
        private readonly configService: ConfigService,
    ) {
        this.defaultTopK =
            this.configService.get<number>('rag.retrievalTopK') || 5;
        this.defaultMinScore =
            this.configService.get<number>('rag.retrievalMinScore') || 0.7;
    }

    // Embeds the user question and executes scoped similarity search
    async retrieve(params: RetrieveParams): Promise<RetrievedChunk[]> {
        const {
            userId,
            query,
            topK = this.defaultTopK,
            minScore = this.defaultMinScore,
            documentIds,
        } = params;

        this.logger.debug(
            `Generating query embedding for retrieval (topK: ${topK}, minScore: ${minScore})`,
        );

        const queryEmbedding = await this.embeddingProvider.embedQuery(query);

        // Query pgvector via custom repository with cosine distance
        const scoredChunks = await this.documentChunkRepository.searchCosineSimilarity(
            userId,
            queryEmbedding,
            topK,
            minScore,
            documentIds,
        );

        this.logger.debug(
            `Retrieved ${scoredChunks.length} chunks meeting similarity threshold ${minScore}`,
        );

        return scoredChunks.map((chunk) => ({
            id: chunk.id,
            documentId: chunk.documentId,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            metadata: chunk.metadata,
            similarity: Number(chunk.similarity),
        }));
    }
}