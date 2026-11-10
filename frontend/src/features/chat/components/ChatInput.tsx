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
        <div className="relative border-t border-[#E5E9EE] bg-white p-4">
            {showFilterDropdown && (
                <div className="absolute bottom-full left-4 mb-2 w-80 rounded-xl border border-[#D5DBE2] bg-white p-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#E5E9EE] pb-2 mb-2">
                        <span className="text-xs font-semibold text-[#121921]">
                            Scope Search to Documents
                        </span>
                        {selectedDocIds.length > 0 && (
                            <button
                                onClick={() => setSelectedDocIds([])}
                                className="text-xs font-medium text-[#8C221A] hover:text-[#731A13]"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {readyDocuments.length === 0 ? (
                            <p className="text-xs text-[#67788A] py-2">No processed documents available.</p>
                        ) : (
                            readyDocuments.map((doc) => (
                                <label
                                    key={doc.id}
                                    className="flex items-center gap-2 rounded-lg p-2 text-xs text-[#34424F] hover:bg-[#F3F5F7] cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedDocIds.includes(doc.id)}
                                        onChange={() => toggleDocumentSelection(doc.id)}
                                        className="rounded border-[#D5DBE2] bg-white text-[#8C221A] focus:ring-[#8C221A]/20"
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
                        className="w-full resize-none rounded-xl border border-[#D5DBE2] bg-[#F8FAFC] px-4 py-3 pr-24 text-sm text-[#121921] placeholder-[#96A3B2] focus:border-[#8C221A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8C221A]/15 transition"
                    />

                    <div className="absolute right-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowFilterDropdown((prev) => !prev)}
                            title="Scope to specific documents"
                            className={`rounded-lg p-2 transition cursor-pointer ${selectedDocIds.length > 0
                                ? 'bg-[#F4EAEB] text-[#8C221A] border border-[#8C221A]/30'
                                : 'text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#121921]'
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
                                className="rounded-lg bg-[#8C221A] p-2 text-white hover:bg-[#731A13] transition disabled:opacity-40 cursor-pointer shadow-xs"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {selectedDocIds.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-[#8C221A] font-medium">
                        <span>Scoped to {selectedDocIds.length} selected document(s)</span>
                    </div>
                )}
            </form>
        </div>
    );
}