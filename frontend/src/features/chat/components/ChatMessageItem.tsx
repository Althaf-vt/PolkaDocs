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
                isAssistant ? 'bg-slate-900/50 border border-slate-800/80' : 'bg-transparent',
            )}
        >
            <div
                className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                    isAssistant
                        ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-700 bg-slate-800 text-slate-300',
                )}
            >
                {isAssistant ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>

            <div className="flex-1 space-y-3 overflow-hidden">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">
                        {isAssistant ? 'PolkaDocs Assistant' : 'You'}
                    </span>
                    {isStreaming && (
                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                    )}
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed text-sm">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>

                {message.citations && message.citations.length > 0 && (
                    <div className="pt-2">
                        <span className="text-xs font-medium text-slate-400 block mb-1.5">
                            Sources & Citations:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {message.citations.map((citation, idx) => (
                                <button
                                    key={`${citation.chunkId}-${idx}`}
                                    onClick={() => onCitationClick?.(citation, idx)}
                                    className="flex items-center gap-1.5 rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/20 transition cursor-pointer"
                                >
                                    <FileText className="h-3 w-3" />
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