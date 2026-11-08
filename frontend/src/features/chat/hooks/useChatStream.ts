import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import { chatApi } from '../../../api/chat.api';
import type {
    Citation,
    SendMessagePayload,
    TokenEventData,
    CitationsEventData,
    DoneEventData,
} from '../../../types/chat.types';

interface UseChatStreamOptions {
    conversationId: string;
    onStreamComplete?: (messageId: string, fullContent: string, citations: Citation[]) => void;
    onError?: (errorMessage: string) => void;
}

// Hook managing token-by-token SSE streaming state and citation parsing
export function useChatStream({
    conversationId,
    onStreamComplete,
    onError,
}: UseChatStreamOptions) {
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamedContent, setStreamedContent] = useState('');
    const [streamedCitations, setStreamedCitations] = useState<Citation[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const { accessToken } = useAuthStore();

    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsStreaming(false);
    }, []);

    const startStream = useCallback(
        async (payload: SendMessagePayload) => {
            if (!accessToken) {
                onError?.('User is not authenticated');
                return;
            }

            setIsStreaming(true);
            setStreamedContent('');
            setStreamedCitations([]);

            abortControllerRef.current = new AbortController();

            try {
                const response = await chatApi.streamMessage(
                    conversationId,
                    payload,
                    accessToken,
                );

                if (!response.ok || !response.body) {
                    throw new Error(`Failed to initiate stream: HTTP ${response.status}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');

                let accumulatedContent = '';
                let accumulatedCitations: Citation[] = [];
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || '';

                    for (const block of lines) {
                        const rawLines = block.split('\n');
                        let eventType = '';
                        let rawData = '';

                        for (const line of rawLines) {
                            if (line.startsWith('event: ')) {
                                eventType = line.replace('event: ', '').trim();
                            } else if (line.startsWith('data: ')) {
                                rawData = line.replace('data: ', '').trim();
                            }
                        }

                        if (!eventType || !rawData) continue;

                        if (eventType === 'token') {
                            const parsed: TokenEventData = JSON.parse(rawData);
                            accumulatedContent += parsed.token;
                            setStreamedContent((prev) => prev + parsed.token);
                        } else if (eventType === 'citations') {
                            const parsed: CitationsEventData = JSON.parse(rawData);
                            accumulatedCitations = parsed.citations;
                            setStreamedCitations(parsed.citations);
                        } else if (eventType === 'done') {
                            const parsed: DoneEventData = JSON.parse(rawData);
                            onStreamComplete?.(parsed.messageId, accumulatedContent, accumulatedCitations);
                        } else if (eventType === 'error') {
                            const parsed = JSON.parse(rawData);
                            const message = parsed?.error?.message || 'Error occurred during streaming';
                            onError?.(message);
                        }
                    }
                }
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return;
                }
                const errorText = err instanceof Error ? err.message : 'Chat streaming failed';
                onError?.(errorText);
            } finally {
                setIsStreaming(false);
            }
        },
        [accessToken, conversationId, onStreamComplete, onError],
    );

    return {
        isStreaming,
        streamedContent,
        streamedCitations,
        startStream,
        stopStreaming,
    };
}