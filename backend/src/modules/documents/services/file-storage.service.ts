import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { AppException } from '../../../common/errors/app.exception';

export interface StoredFileResult {
    storagePath: string;
}

@Injectable()
export class FileStorageService {
    private readonly logger = new Logger(FileStorageService.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        const endpoint = this.configService.get<string>('storage.r2.endpoint');
        const bucketName = this.configService.get<string>('storage.r2.bucketName');
        const accessKeyId = this.configService.get<string>('storage.r2.accessKeyId');
        const secretAccessKey = this.configService.get<string>('storage.r2.secretAccessKey');

        if (!endpoint || !bucketName || !accessKeyId || !secretAccessKey) {
            throw new Error('Cloudflare R2 configuration credentials are missing');
        }

        this.bucketName = bucketName;
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    // Uploads a file buffer to Cloudflare R2 under a user-scoped key
    async uploadFile(
        userId: string,
        fileBuffer: Buffer,
        fileName: string,
        mimeType: string,
    ): Promise<StoredFileResult> {
        const uniqueKey = `${userId}/${Date.now()}-${fileName}`;

        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: uniqueKey,
                    Body: fileBuffer,
                    ContentType: mimeType,
                }),
            );

            return {
                storagePath: uniqueKey,
            };
        } catch (error) {
            this.logger.error(`Failed to upload file ${uniqueKey} to R2`, error);
            throw new AppException(
                'INTERNAL_ERROR',
                'Failed to upload file to storage',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Retrieves file buffer from Cloudflare R2 for text extraction
    async getFileBuffer(storagePath: string): Promise<Buffer> {
        try {
            const response = await this.s3Client.send(
                new GetObjectCommand({
                    Bucket: this.bucketName,
                    Key: storagePath,
                }),
            );

            if (!response.Body) {
                throw new Error('Storage returned an empty response body');
            }

            return await this.streamToBuffer(response.Body as Readable);
        } catch (error) {
            this.logger.error(`Failed to download file ${storagePath} from R2`, error);
            throw new AppException(
                'DOCUMENT_NOT_FOUND',
                'Requested document file could not be retrieved from storage',
                HttpStatus.NOT_FOUND,
            );
        }
    }

    // Deletes an object from Cloudflare R2
    async deleteFile(storagePath: string): Promise<void> {
        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: storagePath,
                }),
            );
        } catch (error) {
            this.logger.error(`Failed to delete file ${storagePath} from R2`, error);
            // Non-blocking catch to prevent orphan DB records if storage delete encounters minor issues
        }
    }

    // Helper converting readable stream into an in-memory buffer
    private async streamToBuffer(stream: Readable): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            stream.on('error', (err) => reject(err));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
}