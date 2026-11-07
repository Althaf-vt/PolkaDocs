import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Retriever, RetrieveParams } from './retriever.interface';
import { RetrievedChunk } from '../interfaces/retrieved-chunk.interface';
import { LangChainEmbeddingProvider } from '../../llm/langchain/langchain-embedding.provider';
import { DocumentChunkRepository } from '../repositories/document-chunk.repository';

@Injectable()
export class LangChainRetriever implements Retriever {
    private readonly logger = new Logger(LangChainRetriever.name);
    private readonly defaultTopK: number;
    private readonly defaultMinScore: number;

    constructor(
        private readonly langChainEmbeddingProvider: LangChainEmbeddingProvider,
        private readonly documentChunkRepository: DocumentChunkRepository,
        private readonly configService: ConfigService,
    ) {
        this.defaultTopK = this.configService.get<number>('rag.retrievalTopK') || 5;
        this.defaultMinScore = this.configService.get<number>('rag.retrievalMinScore') || 0.7;
    }

    async retrieve(params: RetrieveParams): Promise<RetrievedChunk[]> {
        const {
            userId,
            query,
            topK = this.defaultTopK,
            minScore = this.defaultMinScore,
            documentIds,
        } = params;

        this.logger.debug(
            `LangChain query vectorization starting (topK: ${topK}, minScore: ${minScore})`,
        );

        // Vectorize query using LangChain embeddings
        const queryEmbedding = await this.langChainEmbeddingProvider.embedQuery(query);

        // Query pgvector via repository using cosine similarity
        const scoredChunks = await this.documentChunkRepository.searchCosineSimilarity(
            userId,
            queryEmbedding,
            topK,
            minScore,
            documentIds,
        );

        this.logger.debug(
            `LangChain retrieved ${scoredChunks.length} chunks meeting similarity threshold ${minScore}`,
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