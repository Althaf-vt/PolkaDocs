// backend/src/modules/llm/langchain/langchain-embedding.provider.ts
import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';
import { EmbeddingProvider } from '../interfaces/embedding-provider.interface';
import { AppException } from '../../../common/errors/app.exception';

// LangChain embedding provider handling text vectorizations
@Injectable()
export class LangChainEmbeddingProvider implements EmbeddingProvider {
    private readonly logger = new Logger(LangChainEmbeddingProvider.name);
    private readonly client: GoogleGenerativeAIEmbeddings;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('ai.geminiApiKey');
        const model = this.configService.get<string>('ai.embeddingModel') || 'gemini-embedding-001';
        const dimensions = this.configService.get<number>('ai.embeddingDimensions') || 768;

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined in application configuration');
        }

        this.client = new GoogleGenerativeAIEmbeddings({
            apiKey,
            model,
            taskType: TaskType.RETRIEVAL_DOCUMENT,
            outputDimensionality: dimensions,
        });
    }

    async embedDocuments(texts: string[]): Promise<number[][]> {
        if (texts.length === 0) {
            return [];
        }

        try {
            return await this.client.embedDocuments(texts);
        } catch (error) {
            this.handleVendorError(error);
        }
    }

    async embedQuery(text: string): Promise<number[]> {
        try {
            return await this.client.embedQuery(text);
        } catch (error) {
            this.handleVendorError(error);
        }
    }

    // Maps embedding errors to standardized application exceptions
    private handleVendorError(error: unknown): never {
        this.logger.error('LangChain embedding generation failed', error);

        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorDetails = typeof error === 'object' && error !== null ? (error as Record<string, unknown>) : {};

        if (
            errorMessage.includes('429') ||
            errorMessage.includes('RESOURCE_EXHAUSTED') ||
            errorMessage.toLowerCase().includes('rate limit')
        ) {
            throw new AppException(
                'LLM_RATE_LIMITED',
                'LangChain embedding rate limit reached.',
                HttpStatus.TOO_MANY_REQUESTS,
                errorDetails,
            );
        }

        if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE')) {
            throw new AppException(
                'LLM_UNAVAILABLE',
                'LangChain embedding service is temporarily unavailable.',
                HttpStatus.BAD_GATEWAY,
                errorDetails,
            );
        }

        throw new AppException(
            'INTERNAL_ERROR',
            'An unexpected error occurred while generating LangChain embeddings.',
            HttpStatus.INTERNAL_SERVER_ERROR,
            errorDetails,
        );
    }
}