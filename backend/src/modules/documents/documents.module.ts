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
import { LangChainRetriever } from './retrieval/langchain.retriever';

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
        LangChainRetriever,
        {
            provide: RETRIEVER,
            useFactory: (
                configService: ConfigService,
                pgvectorRetriever: PgvectorRetriever,
                LangChainRetriever: LangChainRetriever,
            ) => {
                const providerType = configService.get<string>('ai.provider');

                return providerType === 'langchain' ? LangChainRetriever : pgvectorRetriever;
            },
            inject: [ConfigService, PgvectorRetriever, LangChainRetriever],
        },
    ],
    exports: [DocumentsService, RETRIEVER, DocumentChunkRepository],
})
export class DocumentsModule { }