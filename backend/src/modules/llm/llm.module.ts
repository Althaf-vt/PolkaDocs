import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiClient } from './gemini/gemini.client';
import { GeminiLlmProvider } from './gemini/gemini-llm.provider';
import { GeminiEmbeddingProvider } from './gemini/gemini-embedding.provider';
import { LLM_PROVIDER } from './interfaces/llm-provider.interface';
import { EMBEDDING_PROVIDER } from './interfaces/embedding-provider.interface';

// LLM module providing pluggable LLM and embedding engines
@Module({
    providers: [
        GeminiClient,
        GeminiLlmProvider,
        GeminiEmbeddingProvider,
        {
            provide: LLM_PROVIDER,
            useFactory: (
                configService: ConfigService,
                geminiProvider: GeminiLlmProvider,
            ) => {
                const providerType = configService.get<string>('ai.provider');
                // Defaults to Gemini provider on Day 1-2; LangChain provider binds here on Day 3
                if (providerType === 'langchain') {
                    throw new Error('LangChain LLM provider is scheduled for Day 3');
                }
                return geminiProvider;
            },
            inject: [ConfigService, GeminiLlmProvider],
        },
        {
            provide: EMBEDDING_PROVIDER,
            useFactory: (
                configService: ConfigService,
                geminiEmbeddingProvider: GeminiEmbeddingProvider,
            ) => {
                const providerType = configService.get<string>('ai.provider');
                // Defaults to Gemini embedding provider; LangChain embedding binds here on Day 3
                if (providerType === 'langchain') {
                    throw new Error('LangChain Embedding provider is scheduled for Day 3');
                }
                return geminiEmbeddingProvider;
            },
            inject: [ConfigService, GeminiEmbeddingProvider],
        },
    ],
    exports: [LLM_PROVIDER, EMBEDDING_PROVIDER],
})
export class LlmModule { }