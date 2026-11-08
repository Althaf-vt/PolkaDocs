import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Square, Filter } from 'lucide-react';
import type { DocumentItem } from '../../../types/document.types';

interface ChatInputProps {
    onSendMessage: (content: string, documentIds?: string[]) => void;
    onStopStreaming: () => void;
    isStreaming: boolean;
    documents: DocumentItem[];
}

export function ChatInput({
    onSendMessage,
    onStopStreaming,
    isStreaming,
    documents,
}: ChatInputProps) {
    const [content, setContent] = useState('');
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const readyDocuments = documents.filter((doc) => doc.status === 'ready');

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();
        if (!content.trim() || isStreaming) return;

        onSendMessage(
            content.trim(),
            selectedDocIds.length > 0 ? selectedDocIds : undefined,
        );
        setContent('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const toggleDocumentSelection = (id: string) => {
        setSelectedDocIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    };

    return (
        <div className="relative border-t border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
            {showFilterDropdown && (
                <div className="absolute bottom-full left-4 mb-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <span className="text-xs font-semibold text-slate-300">
                            Scope Search to Documents
                        </span>
                        {selectedDocIds.length > 0 && (
                            <button
                                onClick={() => setSelectedDocIds([])}
                                className="text-xs text-indigo-400 hover:text-indigo-300"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {readyDocuments.length === 0 ? (
                            <p className="text-xs text-slate-500 py-2">No processed documents available.</p>
                        ) : (
                            readyDocuments.map((doc) => (
                                <label
                                    key={doc.id}
                                    className="flex items-center gap-2 rounded-lg p-2 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedDocIds.includes(doc.id)}
                                        onChange={() => toggleDocumentSelection(doc.id)}
                                        className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                                    />
                                    <span className="truncate">{doc.fileName}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div className="relative flex items-center">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about your uploaded documents... (Enter to send, Shift+Enter for newline)"
                        rows={2}
                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-24 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <div className="absolute right-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowFilterDropdown((prev) => !prev)}
                            title="Scope to specific documents"
                            className={`rounded-lg p-2 transition cursor-pointer ${selectedDocIds.length > 0
                                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            <Filter className="h-4 w-4" />
                        </button>

                        {isStreaming ? (
                            <button
                                type="button"
                                onClick={onStopStreaming}
                                title="Stop generation"
                                className="rounded-lg bg-rose-600 p-2 text-white hover:bg-rose-500 transition cursor-pointer"
                            >
                                <Square className="h-4 w-4 fill-current" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!content.trim()}
                                title="Send question"
                                className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500 transition disabled:opacity-40 cursor-pointer"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {selectedDocIds.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-indigo-400">
                        <span>Scoped to {selectedDocIds.length} selected document(s)</span>
                    </div>
                )}
            </form>
        </div>
    );
}