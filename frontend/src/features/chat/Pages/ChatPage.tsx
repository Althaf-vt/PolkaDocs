import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../../../api/chat.api';
import { documentsApi } from '../../../api/documents.api';
import { ConversationSidebar } from '../components/ConversationSidebar';
import { ChatMessageItem } from '../components/ChatMessageItem';
import { ChatInput } from '../components/ChatInput';
import { CitationDrawer } from '../components/CitationDrawer';
import { useChatStream } from '../hooks/useChatStream';
import type { ChatMessage, Citation } from '../../../types/chat.types';
import { MessageSquare } from 'lucide-react';

export function ChatPage() {
    const queryClient = useQueryClient();
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
    const [selectedCitationIdx, setSelectedCitationIdx] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch list of conversations
    const { data: conversations = [] } = useQuery({
        queryKey: ['conversations'],
        queryFn: chatApi.getConversations,
    });

    // Fetch list of documents for scoping
    const { data: documentsData } = useQuery({
        queryKey: ['documents'],
        queryFn: () => documentsApi.getAll(1, 100),
    });

    // Automatically select the most recent conversation on load
    useEffect(() => {
        if (!activeConversationId && conversations.length > 0) {
            setActiveConversationId(conversations[0].id);
        }
    }, [conversations, activeConversationId]);

    // Fetch active conversation messages
    const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
        queryKey: ['messages', activeConversationId],
        queryFn: () =>
            activeConversationId
                ? chatApi.getMessages(activeConversationId)
                : Promise.resolve([]),
        enabled: !!activeConversationId,
    });

    // Scroll to bottom when messages or streamed content changes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Streaming hook
    const {
        isStreaming,
        streamedContent,
        streamedCitations,
        startStream,
        stopStreaming,
    } = useChatStream({
        conversationId: activeConversationId || '',
        onStreamComplete: () => {
            queryClient.invalidateQueries({
                queryKey: ['messages', activeConversationId],
            });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamedContent]);

    // Create conversation mutation
    const createConversationMutation = useMutation({
        mutationFn: (title?: string) => chatApi.createConversation(title),
        onSuccess: (newConv) => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            setActiveConversationId(newConv.id);
        },
    });

    // Delete conversation mutation
    const deleteConversationMutation = useMutation({
        mutationFn: (id: string) => chatApi.deleteConversation(id),
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            if (activeConversationId === deletedId) {
                setActiveConversationId(null);
            }
        },
    });

    // Update conversation title mutation
    const updateTitleMutation = useMutation({
        mutationFn: ({ id, title }: { id: string; title: string }) =>
            chatApi.updateConversation(id, title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const handleSendMessage = (content: string, documentIds?: string[]) => {
        if (!activeConversationId) return;

        // Optimistically push local user message
        const tempUserMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            conversationId: activeConversationId,
            role: 'user',
            content,
            citations: [],
            createdAt: new Date().toISOString(),
        };

        queryClient.setQueryData<ChatMessage[]>(
            ['messages', activeConversationId],
            (old = []) => [...old, tempUserMessage],
        );

        void startStream({ content, documentIds });
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-2xl">
            <ConversationSidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={(id) => setActiveConversationId(id)}
                onCreateConversation={() => createConversationMutation.mutate('New Chat')}
                onUpdateTitle={(id, title) => updateTitleMutation.mutate({ id, title })}
                onDeleteConversation={(id) => deleteConversationMutation.mutate(id)}
            />

            <div className="flex flex-1 flex-col overflow-hidden bg-slate-950/40">
                {activeConversationId ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {isLoadingMessages ? (
                                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                                    Loading messages...
                                </div>
                            ) : messages.length === 0 && !isStreaming ? (
                                <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
                                    <MessageSquare className="h-10 w-10 text-slate-700 mb-3" />
                                    <p className="text-sm font-medium text-slate-400">No messages in this conversation</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Ask a question below to retrieve knowledge from your indexed documents.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg) => (
                                        <ChatMessageItem
                                            key={msg.id}
                                            message={msg}
                                            onCitationClick={(citation, idx) => {
                                                setSelectedCitation(citation);
                                                setSelectedCitationIdx(idx);
                                            }}
                                        />
                                    ))}

                                    {isStreaming && (
                                        <ChatMessageItem
                                            message={{
                                                role: 'assistant',
                                                content: streamedContent,
                                                citations: streamedCitations,
                                            }}
                                            isStreaming={true}
                                            onCitationClick={(citation, idx) => {
                                                setSelectedCitation(citation);
                                                setSelectedCitationIdx(idx);
                                            }}
                                        />
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        <ChatInput
                            onSendMessage={handleSendMessage}
                            onStopStreaming={stopStreaming}
                            isStreaming={isStreaming}
                            documents={documentsData?.items ?? []}
                        />
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
                        <MessageSquare className="h-12 w-12 text-slate-700 mb-3" />
                        <p className="text-sm font-medium text-slate-400">Select or start a new conversation</p>
                        <button
                            onClick={() => createConversationMutation.mutate('New Chat')}
                            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition cursor-pointer"
                        >
                            Start New Chat
                        </button>
                    </div>
                )}
            </div>

            <CitationDrawer
                isOpen={!!selectedCitation}
                citation={selectedCitation}
                citationIndex={selectedCitationIdx}
                onClose={() => {
                    setSelectedCitation(null);
                    setSelectedCitationIdx(null);
                }}
            />
        </div>
    );
}