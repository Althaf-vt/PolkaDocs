import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Document } from './entities/document.entity';
import { DocumentChunk } from './entities/document-chunk.entity';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentsService } from './services/documents.service';
import { IngestionService } from './services/ingestion.service';
import { ChunkerService } from './services/chunker.service';
import { TextExtractorService } from './services/text-extractor.service';
import { FileStorageService } from './services/file-storage.service';
import { DocumentChunkRepository } from './repositories/document-chunk.repository';
import { PgvectorRetriever } from './retrieval/pgvector.retriever';
import { RETRIEVER } from './retrieval/retriever.interface';
import { LlmModule } from '../llm/llm.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Document, DocumentChunk]),
        LlmModule,
    ],
    controllers: [DocumentsController],
    providers: [
        DocumentsService,
        IngestionService,
        ChunkerService,
        TextExtractorService,
        FileStorageService,
        DocumentChunkRepository,
        PgvectorRetriever,
        {
            provide: RETRIEVER,
            useFactory: (
                configService: ConfigService,
                pgvectorRetriever: PgvectorRetriever,
            ) => {
                const providerType = configService.get<string>('ai.provider');
                // Defaults to raw pgvector retriever; LangChain retriever binds here on Day 3
                if (providerType === 'langchain') {
                    throw new Error('LangChain Retriever is scheduled for Day 3');
                }
                return pgvectorRetriever;
            },
            inject: [ConfigService, PgvectorRetriever],
        },
    ],
    exports: [DocumentsService, RETRIEVER, DocumentChunkRepository],
})
export class DocumentsModule { }