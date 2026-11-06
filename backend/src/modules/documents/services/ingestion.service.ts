import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { DocumentChunkRepository } from '../repositories/document-chunk.repository';
import { FileStorageService } from './file-storage.service';
import { TextExtractorService } from './text-extractor.service';
import { ChunkerService } from './chunker.service';
import { EMBEDDING_PROVIDER, type EmbeddingProvider } from '../../llm/interfaces/embedding-provider.interface';

@Injectable()
export class IngestionService {
    private readonly logger = new Logger(IngestionService.name);

    constructor(
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,
        private readonly documentChunkRepository: DocumentChunkRepository,
        private readonly fileStorageService: FileStorageService,
        private readonly textExtractorService: TextExtractorService,
        private readonly chunkerService: ChunkerService,
        @Inject(EMBEDDING_PROVIDER)
        private readonly embeddingProvider: EmbeddingProvider,
    ) { }

    // Executes the asynchronous ingestion pipeline for a given document
    async ingest(documentId: string): Promise<void> {
        const document = await this.documentRepository.findOne({
            where: { id: documentId },
        });

        if (!document) {
            this.logger.error(`Ingestion failed: document ${documentId} not found`);
            return;
        }

        try {
            // Transition document status to processing
            document.status = 'processing';
            document.failureReason = null;
            await this.documentRepository.save(document);

            // Download file buffer from storage
            const fileBuffer = await this.fileStorageService.getFileBuffer(
                document.storagePath,
            );

            // Parse text and extract metadata by MIME type
            const extracted = await this.textExtractorService.extractText(
                fileBuffer,
                document.mimeType,
            );

            if (!extracted.text || extracted.text.trim().length === 0) {
                throw new Error('Extracted document text is empty');
            }

            // Slice text into overlapping chunks
            const chunks = this.chunkerService.chunkText(
                extracted.text,
                extracted.metadata,
            );

            if (chunks.length === 0) {
                throw new Error('No valid chunks produced from document content');
            }

            this.logger.log(
                `Document ${documentId}: extracted ${chunks.length} chunks. Generating embeddings...`,
            );

            // Vectorize chunks in batch using the configured embedding provider
            const chunkTexts = chunks.map((chunk) => chunk.content);
            const embeddings = await this.embeddingProvider.embedDocuments(chunkTexts);

            if (embeddings.length !== chunks.length) {
                throw new Error('Mismatched vector output count from embedding provider');
            }

            // Persist chunks with embeddings in pgvector
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const embedding = embeddings[i];

                await this.documentChunkRepository.insertChunkWithVector(
                    document.id,
                    document.userId,
                    chunk.chunkIndex,
                    chunk.content,
                    chunk.metadata,
                    embedding,
                );
            }

            // Mark document as ready for retrieval
            document.status = 'ready';
            await this.documentRepository.save(document);

            this.logger.log(`Document ${documentId} ingestion completed successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(
                `Document ${documentId} ingestion pipeline failed: ${errorMessage}`,
                error,
            );

            // Flag document as failed with failure reason
            document.status = 'failed';
            document.failureReason = errorMessage;
            await this.documentRepository.save(document);
        }
    }

    // Deletes existing chunks and vectors and re-runs the ingestion pipeline
    async reprocess(documentId: string): Promise<void> {
        const document = await this.documentRepository.findOne({
            where: { id: documentId },
        });

        if (!document) {
            throw new Error(`Document ${documentId} not found`);
        }

        // Remove old chunks before re-running pipeline
        await this.documentChunkRepository.delete({ documentId });

        // Trigger ingestion asynchronously
        void this.ingest(documentId);
    }
}