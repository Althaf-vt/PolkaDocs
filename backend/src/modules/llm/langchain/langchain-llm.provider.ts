import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { LlmProvider, GenerateInput, GenerateOutput } from '../interfaces/llm-provider.interface';
import { AppException } from '../../../common/errors/app.exception';

@Injectable()
export class LangChainLlmProvider implements LlmProvider {
    private readonly logger = new Logger(LangChainLlmProvider.name);
    private readonly apiKey: string;
    private readonly chatModel: string;

    constructor(private readonly configService: ConfigService) {
        const key = this.configService.get<string>('ai.geminiApiKey');
        if (!key) {
            throw new Error('GEMINI_API_KEY is not defined in application configuration');
        }

        this.apiKey = key;
        this.chatModel = this.configService.get<string>('ai.chatModel') || 'gemini-2.0-flash';
    }

    // Generates complete textual response and token usage via LangChain
    async generate(input: GenerateInput): Promise<GenerateOutput> {
        try {
            const model = this.instantiateModel(input.temperature, input.maxOutputTokens);
            const messages = this.formatMessages(input);

            const response = await model.invoke(messages);

            const content = typeof response.content === 'string'
                ? response.content
                : JSON.stringify(response.content);

            const usageMetadata = response.usage_metadata;

            return {
                content,
                promptTokens: usageMetadata?.input_tokens,
                completionTokens: usageMetadata?.output_tokens,
                totalTokens: usageMetadata?.total_tokens,
            };
        } catch (error) {
            this.handleVendorError(error);
        }
    }

    // Streams tokens asynchronously using LangChain stream API
    async *stream(input: GenerateInput): AsyncIterable<string> {
        try {
            const model = this.instantiateModel(input.temperature, input.maxOutputTokens);
            const messages = this.formatMessages(input);

            const responseStream = await model.stream(messages);

            for await (const chunk of responseStream) {
                if (typeof chunk.content === 'string' && chunk.content.length > 0) {
                    yield chunk.content;
                } else if (Array.isArray(chunk.content)) {
                    for (const part of chunk.content) {
                        if (typeof part === 'string') {
                            yield part;
                        } else if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
                            yield part.text;
                        }
                    }
                }
            }
        } catch (error) {
            this.handleVendorError(error);
        }
    }

    // Instantiates configured ChatGoogleGenerativeAI client
    private instantiateModel(temperature?: number, maxOutputTokens?: number): ChatGoogleGenerativeAI {
        return new ChatGoogleGenerativeAI({
            apiKey: this.apiKey,
            model: this.chatModel,
            temperature: temperature ?? 0.7,
            maxOutputTokens,
        });
    }

    // Converts domain input into LangChain BaseMessage array
    private formatMessages(input: GenerateInput): BaseMessage[] {
        const messages: BaseMessage[] = [];

        if (input.systemInstruction) {
            messages.push(new SystemMessage(input.systemInstruction));
        }

        if (input.messages && input.messages.length > 0) {
            for (const msg of input.messages) {
                if (msg.role === 'assistant') {
                    messages.push(new AIMessage(msg.content));
                } else if (msg.role === 'system') {
                    messages.push(new SystemMessage(msg.content));
                } else {
                    messages.push(new HumanMessage(msg.content));
                }
            }
        } else if (input.prompt) {
            messages.push(new HumanMessage(input.prompt));
        }

        return messages;
    }

    // Intercepts and maps vendor errors to uniform application exceptions
    private handleVendorError(error: unknown): never {
        this.logger.error('LangChain LLM invocation failed', error);

        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorDetails = typeof error === 'object' && error !== null ? (error as Record<string, unknown>) : {};

        if (
            errorMessage.includes('429') ||
            errorMessage.includes('RESOURCE_EXHAUSTED') ||
            errorMessage.toLowerCase().includes('rate limit')
        ) {
            throw new AppException(
                'LLM_RATE_LIMITED',
                'LangChain LLM provider rate limit exceeded. Please retry later.',
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
                'LangChain LLM provider service is temporarily unavailable.',
                HttpStatus.BAD_GATEWAY,
                errorDetails,
            );
        }

        throw new AppException(
            'INTERNAL_ERROR',
            'An unexpected error occurred while communicating with LangChain LLM.',
            HttpStatus.INTERNAL_SERVER_ERROR,
            errorDetails,
        );
    }
}