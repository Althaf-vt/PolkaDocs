import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiClient } from './gemini.client';
import { EmbeddingProvider } from '../interfaces/embedding-provider.interface';
import { AppException } from '../../../common/errors/app.exception';

// Gemini embedding provider handling single-string and batch vectorizations
@Injectable()
export class GeminiEmbeddingProvider implements EmbeddingProvider {
    private readonly logger = new Logger(GeminiEmbeddingProvider.name);
    private readonly embeddingModel: string;
    private readonly dimensions: number;

    constructor(
        private readonly geminiClient: GeminiClient,
        private readonly configService: ConfigService,
    ) {
        this.embeddingModel = this.configService.get<string>('ai.embeddingModel') || 'text-embedding-004';
        this.dimensions = this.configService.get<number>('ai.embeddingDimensions') || 768;
    }

    // Vectorizes a batch of documents or chunks
    async embedDocuments(texts: string[]): Promise<number[][]> {
        if (texts.length === 0) {
            return [];
        }

        try {
            const response = await this.geminiClient.getClient().models.embedContent({
                model: this.embeddingModel,
                contents: texts,
                config: {
                    outputDimensionality: this.dimensions,
                },
            });

            if (!response.embeddings || response.embeddings.length === 0) {
                throw new Error('No embeddings returned by Gemini API');
            }

            return response.embeddings.map((item) => item.values || []);
        } catch (error) {
            this.handleVendorError(error);
        }
    }

    // Vectorizes a single query string for semantic similarity searches
    async embedQuery(text: string): Promise<number[]> {
        try {
            const response = await this.geminiClient.getClient().models.embedContent({
                model: this.embeddingModel,
                contents: text,
                config: {
                    outputDimensionality: this.dimensions,
                },
            });

            const embeddingValues = response.embeddings?.[0]?.values;

            if (!embeddingValues) {
                throw new Error('No embedding values returned for the provided query');
            }

            return embeddingValues;
        } catch (error) {
            this.handleVendorError(error);
        }
    }

    // Intercepts vendor-specific embedding errors
    private handleVendorError(error: unknown): never {
        this.logger.error('Gemini embedding generation failed', error);

        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorDetails = typeof error === 'object' && error !== null ? (error as Record<string, unknown>) : {};

        if (
            errorMessage.includes('429') ||
            errorMessage.includes('RESOURCE_EXHAUSTED') ||
            errorMessage.toLowerCase().includes('rate limit')
        ) {
            throw new AppException(
                'LLM_RATE_LIMITED',
                'Gemini embedding rate limit reached.',
                HttpStatus.TOO_MANY_REQUESTS,
                errorDetails,
            );
        }

        if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE')) {
            throw new AppException(
                'LLM_UNAVAILABLE',
                'Gemini embedding service is temporarily unavailable.',
                HttpStatus.BAD_GATEWAY,
                errorDetails,
            );
        }

        throw new AppException(
            'INTERNAL_ERROR',
            'An unexpected error occurred while generating embeddings.',
            HttpStatus.INTERNAL_SERVER_ERROR,
            errorDetails,
        );
    }
}