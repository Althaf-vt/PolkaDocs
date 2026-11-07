import { Citation } from './citation.interface';

// Strongly typed discriminated union for SSE streaming
export type ChatStreamEvent =
    | { event: 'token'; data: { token: string } }
    | { event: 'citations'; data: { citations: Citation[] } }
    | { event: 'done'; data: { messageId: string } };