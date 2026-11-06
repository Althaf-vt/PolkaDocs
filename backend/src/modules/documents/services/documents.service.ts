import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Document } from '../entities/document.entity';
import { FileStorageService } from './file-storage.service';
import { IngestionService } from './ingestion.service';
import { DocumentQueryDto } from '../dto/document-query.dto';
import { AppException } from '../../../common/errors/app.exception';
import { SUPPORTED_MIME_TYPES, SupportedMimeType } from '../constants/mime-types.constant';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';

@Injectable()
export class DocumentsService {
    private readonly logger = new Logger(DocumentsService.name);
    private readonly maxUploadBytes: number;

    constructor(
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,
        private readonly fileStorageService: FileStorageService,
        private readonly ingestionService: IngestionService,
        private readonly configService: ConfigService,
    ) {
        const maxMb = this.configService.get<number>('storage.maxUploadMb') || 10;
        this.maxUploadBytes = maxMb * 1024 * 1024;
    }

    async upload(userId: string, file: Express.Multer.File): Promise<Document> {
        if (!file) {
            throw new AppException(
                'VALIDATION_ERROR',
                'No file was uploaded',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (!SUPPORTED_MIME_TYPES.includes(file.mimetype as SupportedMimeType)) {
            throw new AppException(
                'DOCUMENT_UNSUPPORTED_TYPE',
                `Unsupported file MIME type: ${file.mimetype}`,
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            );
        }

        if (file.size > this.maxUploadBytes) {
            throw new AppException(
                'DOCUMENT_TOO_LARGE',
                `File size exceeds maximum allowed limit of ${this.maxUploadBytes / (1024 * 1024)} MB`,
                HttpStatus.PAYLOAD_TOO_LARGE,
            );
        }

        // Persist file into Cloudflare R2
        const storageResult = await this.fileStorageService.uploadFile(
            userId,
            file.buffer,
            file.originalname,
            file.mimetype,
        );

        // Create database entity with initial uploaded status
        const document = this.documentRepository.create({
            userId,
            fileName: file.originalname,
            mimeType: file.mimetype as SupportedMimeType,
            sizeBytes: file.size,
            storagePath: storageResult.storagePath,
            status: 'uploaded',
        });

        const savedDocument = await this.documentRepository.save(document);

        this.logger.log(`Document uploaded: ${savedDocument.id} (${file.originalname}) for user ${userId}`);

        // Fire ingestion workflow asynchronously without blocking HTTP response
        void this.ingestionService.ingest(savedDocument.id);

        return savedDocument;
    }

    async findAll(userId: string, query: DocumentQueryDto): Promise<PaginatedResult<Document>> {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const [items, total] = await this.documentRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(userId: string, documentId: string): Promise<Document> {
        const document = await this.documentRepository.findOne({
            where: { id: documentId, userId },
        });

        if (!document) {
            throw new AppException(
                'DOCUMENT_NOT_FOUND',
                `Document with id ${documentId} not found`,
                HttpStatus.NOT_FOUND,
            );
        }

        return document;
    }

    async reprocess(userId: string, documentId: string): Promise<Document> {
        const document = await this.findById(userId, documentId);

        document.status = 'processing';
        document.failureReason = null;
        const updatedDocument = await this.documentRepository.save(document);

        this.logger.log(`Document reprocess requested: ${documentId} for user ${userId}`);

        void this.ingestionService.reprocess(documentId);

        return updatedDocument;
    }

    async delete(userId: string, documentId: string): Promise<void> {
        const document = await this.findById(userId, documentId);

        await this.fileStorageService.deleteFile(document.storagePath);

        await this.documentRepository.remove(document);

        this.logger.log(`Document deleted: ${documentId} for user ${userId}`);
    }
}