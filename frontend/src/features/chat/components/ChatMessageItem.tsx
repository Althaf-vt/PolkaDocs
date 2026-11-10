import ReactMarkdown from 'react-markdown';
import { User, FileText } from 'lucide-react';
import type { ChatMessage, Citation } from '../../../types/chat.types';
import { cn } from '../../../lib/utils';
import { ThinkingIndicator } from '@/components/ui/thinking-indicator';
import { PolkaDocsIcon } from '@/components/ui/polkadocs-icon';

interface ChatMessageItemProps {
    message: Pick<ChatMessage, 'role' | 'content' | 'citations'>;
    isStreaming?: boolean;
    onCitationClick?: (citation: Citation, index: number) => void;
}

export function ChatMessageItem({
    message,
    isStreaming,
    onCitationClick,
}: ChatMessageItemProps) {
    const isAssistant = message.role === 'assistant';

    // Show polished thinking state when waiting for the first stream token
    if (isAssistant && isStreaming && !message.content) {
        return (
            <div className="flex w-full justify-start">
                <div className="rounded-2xl border border-[#E5E9EE] bg-white p-4 shadow-xs max-w-[88%] sm:max-w-[80%]">
                    <ThinkingIndicator
                        assistantAvatar={<PolkaDocsIcon className="h-4.5 w-4.5" />}
                        labels={{
                            thinking: 'Searching knowledge base & thinking',
                            thinkingRegion: 'PolkaDocs AI is generating a response',
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex w-full', isAssistant ? 'justify-start' : 'justify-end')}>
            <div
                className={cn(
                    'flex gap-4 p-4 rounded-2xl transition max-w-[88%] sm:max-w-[80%]',
                    isAssistant
                        ? 'bg-white border border-[#E5E9EE] shadow-xs'
                        : 'bg-[#F3F5F7] border border-[#D5DBE2] shadow-xs',
                )}
            >
                <div
                    className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                        isAssistant
                            ? 'border-[#8C221A]/20 bg-[#F4EAEB]'
                            : 'border-[#D5DBE2] bg-white text-[#34424F]',
                    )}
                >
                    {isAssistant ? <PolkaDocsIcon className="h-4.5 w-4.5" /> : <User className="h-4 w-4" />}
                </div>

                <div className="flex-1 space-y-3 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#121921]">
                            {isAssistant ? 'PolkaDocs Assistant' : 'You'}
                        </span>
                        {isStreaming && (
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#8C221A]" />
                        )}
                    </div>

                    <div className="prose prose-slate prose-sm max-w-none text-[#34424F] leading-relaxed text-sm">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>

                    {message.citations && message.citations.length > 0 && (
                        <div className="pt-2">
                            <span className="text-xs font-medium text-[#67788A] block mb-1.5">
                                Sources & Citations:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {message.citations.map((citation, idx) => (
                                    <button
                                        key={`${citation.chunkId}-${idx}`}
                                        onClick={() => onCitationClick?.(citation, idx)}
                                        className="flex items-center gap-1.5 rounded-md border border-[#8C221A]/20 bg-[#F4EAEB] px-2.5 py-1 text-xs font-medium text-[#8C221A] hover:border-[#8C221A]/40 hover:bg-[#EADCE0] transition cursor-pointer"
                                    >
                                        <FileText className="h-3 w-3 text-[#8C221A]" />
                                        <span>[{idx + 1}] Source Chunk</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}