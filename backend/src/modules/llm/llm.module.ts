import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiClient } from './gemini/gemini.client';
import { GeminiLlmProvider } from './gemini/gemini-llm.provider';
import { GeminiEmbeddingProvider } from './gemini/gemini-embedding.provider';
import { LLM_PROVIDER } from './interfaces/llm-provider.interface';
import { EMBEDDING_PROVIDER } from './interfaces/embedding-provider.interface';
import { LangChainLlmProvider } from './langchain/langchain-llm.provider';
import { LangChainEmbeddingProvider } from './langchain/langchain-embedding.provider';

@Module({
    providers: [
        GeminiClient,
        GeminiLlmProvider,
        GeminiEmbeddingProvider,
        LangChainLlmProvider,
        LangChainEmbeddingProvider,
        {
            provide: LLM_PROVIDER,
            useFactory: (
                configService: ConfigService,
                geminiProvider: GeminiLlmProvider,
                langChainProvider: LangChainLlmProvider
            ) => {
                const providerType = configService.get<string>('ai.provider');

                return providerType === 'langchain' ? langChainProvider : geminiProvider;
            },
            inject: [ConfigService, GeminiLlmProvider, LangChainLlmProvider],
        },
        {
            provide: EMBEDDING_PROVIDER,
            useFactory: (
                configService: ConfigService,
                geminiEmbeddingProvider: GeminiEmbeddingProvider,
                langChainEmbeddingProvider: LangChainEmbeddingProvider,
            ) => {
                const providerType = configService.get<string>('ai.provider');

                return providerType === 'langchain' ? langChainEmbeddingProvider : geminiEmbeddingProvider;
            },
            inject: [ConfigService, GeminiEmbeddingProvider, LangChainEmbeddingProvider],
        },
    ],
    exports: [LLM_PROVIDER, EMBEDDING_PROVIDER, LangChainEmbeddingProvider],
})
export class LlmModule { }