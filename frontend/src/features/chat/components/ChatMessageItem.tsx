import ReactMarkdown from 'react-markdown';
import { User, Sparkles, FileText } from 'lucide-react';
import type { ChatMessage, Citation } from '../../../types/chat.types';
import { cn } from '../../../lib/utils';

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

    return (
        <div
            className={cn(
                'flex gap-4 p-4 rounded-xl transition',
                isAssistant ? 'bg-white border border-[#E5E9EE] shadow-xs' : 'bg-[#F3F5F7]/80 border border-[#E5E9EE]/60',
            )}
        >
            <div
                className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                    isAssistant
                        ? 'border-[#8C221A]/25 bg-[#F4EAEB] text-[#8C221A]'
                        : 'border-[#D5DBE2] bg-white text-[#34424F]',
                )}
            >
                {isAssistant ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
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
    );
}