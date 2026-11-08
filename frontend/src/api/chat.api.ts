import { apiClient } from './client';
import type {
    ConversationItem,
    ChatMessage,
    SendMessagePayload,
} from '../types/chat.types';

export const chatApi = {
    // Lists all user conversations ordered by updated date
    getConversations: async (): Promise<ConversationItem[]> => {
        const response = await apiClient.get<ConversationItem[]>('/conversations');
        return response.data;
    },

    // Creates a new conversation
    createConversation: async (title?: string): Promise<ConversationItem> => {
        const response = await apiClient.post<ConversationItem>('/conversations', {
            title,
        });
        return response.data;
    },

    // Fetches message history for a conversation
    getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
        const response = await apiClient.get<ChatMessage[]>(
            `/conversations/${conversationId}/messages`,
        );
        return response.data;
    },

    // Updates a conversation title
    updateConversation: async (
        conversationId: string,
        title: string,
    ): Promise<ConversationItem> => {
        const response = await apiClient.patch<ConversationItem>(
            `/conversations/${conversationId}`,
            { title },
        );
        return response.data;
    },

    // Deletes a conversation and its messages
    deleteConversation: async (conversationId: string): Promise<void> => {
        await apiClient.delete(`/conversations/${conversationId}`);
    },

    // Opens a Server-Sent Events stream for asking a question via POST
    streamMessage: async (
        conversationId: string,
        payload: SendMessagePayload,
        accessToken: string,
    ): Promise<Response> => {
        return fetch(`/api/v1/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });
    },
};