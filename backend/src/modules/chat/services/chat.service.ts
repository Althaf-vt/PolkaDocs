import { Injectable, Inject, HttpStatus, Logger } from '@nestjs/common';
import { ChatStreamEvent } from '../interfaces/chat-stream-event.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';
import { PromptBuilderService } from './prompt-builder.service';
import { RETRIEVER, type Retriever } from '../../documents/retrieval/retriever.interface';
import { LLM_PROVIDER, type LlmProvider } from '../../llm/interfaces/llm-provider.interface';
import { AppException } from '../../../common/errors/app.exception';
import { Citation } from '../interfaces/citation.interface';


@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @Inject(RETRIEVER)
        private readonly retriever: Retriever,
        @Inject(LLM_PROVIDER)
        private readonly llmProvider: LlmProvider,
        private readonly promptBuilderService: PromptBuilderService,
    ) { }

    // Creates a new conversation container
    async createConversation(
        userId: string,
        createConversationDto: CreateConversationDto,
    ): Promise<Conversation> {
        const conversation = this.conversationRepository.create({
            userId,
            title: createConversationDto.title || 'New Conversation',
        });

        const saved = await this.conversationRepository.save(conversation);
        this.logger.log(`Conversation created: ${saved.id} for user ${userId}`);
        return saved;
    }

    // Lists all conversations belonging to the user
    async findConversations(userId: string): Promise<Conversation[]> {
        return this.conversationRepository.find({
            where: { userId },
            order: { updatedAt: 'DESC' },
        });
    }

    // Retrieves a single conversation scoped to user
    async findConversation(userId: string, conversationId: string): Promise<Conversation> {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId, userId },
        });

        if (!conversation) {
            throw new AppException(
                'CONVERSATION_NOT_FOUND',
                `Conversation with id ${conversationId} not found`,
                HttpStatus.NOT_FOUND,
            );
        }

        return conversation;
    }

    // Retrieves ordered messages for a conversation
    async getMessages(userId: string, conversationId: string): Promise<Message[]> {
        await this.findConversation(userId, conversationId);

        return this.messageRepository.find({
            where: { conversationId },
            order: { createdAt: 'ASC' },
        });
    }

    // Renames an existing conversation title
    async updateConversation(
        userId: string,
        conversationId: string,
        updateConversationDto: UpdateConversationDto,
    ): Promise<Conversation> {
        const conversation = await this.findConversation(userId, conversationId);
        conversation.title = updateConversationDto.title;
        return this.conversationRepository.save(conversation);
    }

    // Deletes conversation and cascades messages
    async deleteConversation(userId: string, conversationId: string): Promise<void> {
        const conversation = await this.findConversation(userId, conversationId);
        await this.conversationRepository.remove(conversation);
        this.logger.log(`Conversation deleted: ${conversationId} for user ${userId}`);
    }

    // Orchestrates RAG flow: stores prompt, searches pgvector, streams tokens, and saves assistant turn
    async *streamQuestion(
        userId: string,
        conversationId: string,
        sendMessageDto: SendMessageDto,
    ): AsyncIterable<ChatStreamEvent> {
        const conversation = await this.findConversation(userId, conversationId);
        this.logger.log(`Question received in conversation ${conversationId} from user ${userId}`);

        // Persist incoming user question
        const userMessage = this.messageRepository.create({
            conversationId: conversation.id,
            role: 'user',
            content: sendMessageDto.content,
            citations: [],
        });
        await this.messageRepository.save(userMessage);

        // Retrieve context chunks passing similarity threshold
        const chunks = await this.retriever.retrieve({
            userId,
            query: sendMessageDto.content,
            documentIds: sendMessageDto.documentIds,
        });
        this.logger.debug(`Retrieved ${chunks.length} chunks for conversation ${conversationId}`);

        // Fetch previous 6 turns for conversational context
        const recentMessages = await this.messageRepository.find({
            where: { conversationId: conversation.id },
            order: { createdAt: 'DESC' },
            take: 6,
        });
        const history = recentMessages.reverse().slice(0, -1);

        // Build grounded prompt with instructions and cited chunks
        const builtPrompt = this.promptBuilderService.buildRagPrompt(
            sendMessageDto.content,
            chunks,
            history,
        );

        let fullGeneratedContent = '';

        // Stream LLM tokens asynchronously
        const tokenStream = this.llmProvider.stream({
            messages: builtPrompt.messages,
            systemInstruction: builtPrompt.systemInstruction,
        });

        for await (const token of tokenStream) {
            fullGeneratedContent += token;
            yield {
                event: 'token',
                data: { token },
            };
        }

        // Build citations reference metadata
        const citations: Citation[] = chunks.map((chunk) => ({
            documentId: chunk.documentId,
            chunkId: chunk.id,
            snippet: chunk.content.slice(0, 200),
        }));

        // Persist completed assistant message with citations
        const assistantMessage = this.messageRepository.create({
            conversationId: conversation.id,
            role: 'assistant',
            content: fullGeneratedContent,
            citations,
        });
        const savedAssistantMessage = await this.messageRepository.save(assistantMessage);
        this.logger.log(
            `Completed response (${fullGeneratedContent.length} chars, ${citations.length} citations) in conversation ${conversationId}`,
        );

        // Emit citations metadata event
        yield {
            event: 'citations',
            data: { citations },
        };

        // Emit stream termination event
        yield {
            event: 'done',
            data: {
                messageId: savedAssistantMessage.id,
            },
        };
    }
}