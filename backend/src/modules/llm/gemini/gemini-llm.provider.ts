import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiClient } from './gemini.client';
import { LlmProvider, GenerateInput, GenerateOutput } from '../interfaces/llm-provider.interface';
import { AppException } from '../../../common/errors/app.exception';
import { ContentListUnion } from '@google/genai';

@Injectable()
export class GeminiLlmProvider implements LlmProvider {
    private readonly logger = new Logger(GeminiLlmProvider.name);
    private readonly chatModel: string;

    constructor(
        private readonly geminiClient: GeminiClient,
        private readonly configService: ConfigService,
    ) {
        this.chatModel = this.configService.get<string>('ai.chatModel') || 'gemini-2.0-flash';
    }

    // Generates complete textual output along with token usage statistics
    async generate(input: GenerateInput): Promise<GenerateOutput> {
        try {
            const contents = this.formatContents(input);

            const response = await this.geminiClient.getClient().models.generateContent({
                model: this.chatModel,
                contents,
                config: {
                    systemInstruction: input.systemInstruction,
                    temperature: input.temperature,
                    maxOutputTokens: input.maxOutputTokens,
                },
            });

            return {
                content: response.text || '',
                promptTokens: response.usageMetadata?.promptTokenCount,
                completionTokens: response.usageMetadata?.candidatesTokenCount,
                totalTokens: response.usageMetadata?.totalTokenCount,
            };
        } catch (error) {
            this.handleVendorError(error);
        }
    }

    // Streams textual response chunks asynchronously
    async *stream(input: GenerateInput): AsyncIterable<string> {
        try {
            const contents = this.formatContents(input);

            const responseStream = await this.geminiClient.getClient().models.generateContentStream({
                model: this.chatModel,
                contents,
                config: {
                    systemInstruction: input.systemInstruction,
                    temperature: input.temperature,
                    maxOutputTokens: input.maxOutputTokens,
                },
            });

            for await (const chunk of responseStream) {
                if (chunk.text) {
                    yield chunk.text;
                }
            }
        } catch (error) {
            this.handleVendorError(error);
        }
    }

    // Formats raw prompts or multi-turn messages into Gemini SDK contents format
    private formatContents(input: GenerateInput): ContentListUnion {
        if (input.messages && input.messages.length > 0) {
            return input.messages.map((message) => ({
                role: message.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: message.content }],
            }));
        }

        return input.prompt || '';
    }

    // Intercepts vendor-specific errors and maps them to standard application exceptions
    private handleVendorError(error: unknown): never {
        this.logger.error('Gemini LLM invocation failed', error);

        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorDetails = typeof error === 'object' && error !== null ? (error as Record<string, unknown>) : {};

        if (
            errorMessage.includes('429') ||
            errorMessage.includes('RESOURCE_EXHAUSTED') ||
            errorMessage.toLowerCase().includes('rate limit')
        ) {
            throw new AppException(
                'LLM_RATE_LIMITED',
                'Gemini rate limit exceeded. Please retry after some time.',
                HttpStatus.TOO_MANY_REQUESTS,
                errorDetails,
            );
        }

        if (
            errorMessage.includes('503') ||
            errorMessage.includes('UNAVAILABLE') ||
            errorMessage.toLowerCase().includes('timeout')
        ) {
            throw new AppException(
                'LLM_UNAVAILABLE',
                'Gemini service is currently unavailable or timed out.',
                HttpStatus.BAD_GATEWAY,
                errorDetails,
            );
        }

        throw new AppException(
            'INTERNAL_ERROR',
            'An unexpected error occurred while communicating with Gemini LLM.',
            HttpStatus.INTERNAL_SERVER_ERROR,
            errorDetails,
        );
    }
}