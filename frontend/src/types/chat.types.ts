export type MessageRole = 'user' | 'assistant';

// Citation reference contract
export interface Citation {
    documentId: string;
    chunkId: string;
    snippet: string;
}

// Single chat message entity
export interface ChatMessage {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    citations: Citation[];
    createdAt: string;
}

// Conversation entity
export interface ConversationItem {
    id: string;
    userId: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
}

// Payload for asking a question
export interface SendMessagePayload {
    content: string;
    documentIds?: string[];
}

// Server-sent events parsed payload types
export interface TokenEventData {
    token: string;
}

export interface CitationsEventData {
    citations: Citation[];
}

export interface DoneEventData {
    messageId: string;
}