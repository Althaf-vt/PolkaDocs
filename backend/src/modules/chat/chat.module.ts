import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { DocumentsModule } from '../documents/documents.module';
import { LlmModule } from '../llm/llm.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, Message]),
        DocumentsModule,
        LlmModule,
    ],
    controllers: [ChatController],
    providers: [ChatService, PromptBuilderService],
    exports: [ChatService],
})
export class ChatModule { }