import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Res,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from '../services/chat.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AppException } from '../../../common/errors/app.exception';

@Controller('conversations')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post()
    async createConversation(
        @CurrentUser('id') userId: string,
        @Body() createConversationDto: CreateConversationDto,
    ): Promise<Conversation> {
        return this.chatService.createConversation(userId, createConversationDto);
    }

    @Get()
    async findConversations(@CurrentUser('id') userId: string): Promise<Conversation[]> {
        return this.chatService.findConversations(userId);
    }

    @Get(':id/messages')
    async getMessages(
        @CurrentUser('id') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<Message[]> {
        return this.chatService.getMessages(userId, id);
    }

    @Post(':id/messages')
    async askQuestion(
        @CurrentUser('id') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() sendMessageDto: SendMessageDto,
        @Res() res: Response,
    ): Promise<void> {
        // Configure SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        let isClientConnected = true;
        res.on('close', () => {
            isClientConnected = false;
        });

        try {
            const stream = this.chatService.streamQuestion(userId, id, sendMessageDto);
            for await (const eventPacket of stream) {
                // If client is still here, send the tokens over the wire
                // If client closed tab, skip res.write, but let the loop finish & save to DB!
                if (isClientConnected) {
                    res.write(`event: ${eventPacket.event}\ndata: ${JSON.stringify(eventPacket.data)}\n\n`);
                }
            }
            if (isClientConnected) {
                res.end();
            }
        } catch (error) {
            // If the user already closed the connection, do not attempt to write the error frame
            if (!isClientConnected) {
                return;
            }
            const errorPayload =
                error instanceof AppException
                    ? error.getResponse()
                    : {
                        error: {
                            code: 'INTERNAL_ERROR',
                            message: error instanceof Error ? error.message : 'An unexpected error occurred during chat streaming',
                            details: {},
                        },
                    };
            res.write(`event: error\ndata: ${JSON.stringify(errorPayload)}\n\n`);
            res.end();
        }
    }

    @Patch(':id')
    async updateConversation(
        @CurrentUser('id') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateConversationDto: UpdateConversationDto,
    ): Promise<Conversation> {
        return this.chatService.updateConversation(userId, id, updateConversationDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteConversation(
        @CurrentUser('id') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<void> {
        await this.chatService.deleteConversation(userId, id);
    }
}