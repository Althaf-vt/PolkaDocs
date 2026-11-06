import { Injectable } from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { RetrievedChunk } from 'src/modules/documents/interfaces/retrieved-chunk.interface';
import { ChatMessage } from 'src/modules/llm/interfaces/llm-provider.interface';
import { BuiltPrompt } from '../interfaces/built-prompt.interface';
import { RAG_SYSTEM_INSTRUCTION } from '../constants/prompts.constant';

@Injectable()
export class PromptBuilderService {
    // Assembles system rules, retrieved chunks, and history into messages
    buildRagPrompt(
        question: string,
        chunks: RetrievedChunk[],
        history: Message[] = [],
    ): BuiltPrompt {
        const systemInstruction = RAG_SYSTEM_INSTRUCTION;

        let contextBlock = 'No document context available.';

        if (chunks.length > 0) {
            contextBlock = chunks
                .map(
                    (chunk, index) =>
                        `[${index + 1}] Document ID: ${chunk.documentId} | Chunk ID: ${chunk.id}\n${chunk.content}`,
                )
                .join('\n\n---\n\n');
        }

        const messages: ChatMessage[] = [];

        // Append previous message history (last N turns)
        for (const msg of history) {
            messages.push({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
            });
        }

        // Append the current user prompt with injected context
        const contextualizedUserPrompt = [
            'DOCUMENT CONTEXT:',
            contextBlock,
            '',
            'USER QUESTION:',
            question,
        ].join('\n');

        messages.push({
            role: 'user',
            content: contextualizedUserPrompt,
        });

        return {
            systemInstruction,
            messages,
        };
    }
}