import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Square, Files, X } from 'lucide-react';
import type { DocumentItem } from '../../../types/document.types';
import { cn } from '../../../lib/utils';
import { Magnet } from '@/components/ui/magnet';

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

    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Auto-close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowFilterDropdown(false);
            }
        };

        if (showFilterDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFilterDropdown]);

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
            {/* Document Scoping Popover positioned on the right, above the trigger button */}
            {showFilterDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute bottom-full right-4 mb-3 w-80 sm:w-96 rounded-2xl border border-[#D5DBE2] bg-white p-4 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150"
                >
                    <div className="flex items-center justify-between border-b border-[#E5E9EE] pb-2.5 mb-2.5">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#F4EAEB] p-1 text-[#8C221A]">
                                <Files className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-bold text-[#121921]">
                                Scope to Documents
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {selectedDocIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedDocIds([])}
                                    className="text-xs font-semibold text-[#8C221A] hover:text-[#731A13] transition cursor-pointer"
                                >
                                    Clear all
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowFilterDropdown(false)}
                                title="Close"
                                className="rounded-lg p-1 text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#121921] transition cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <p className="text-[11px] text-[#67788A] mb-2 leading-relaxed">
                        Select specific files to constrain the search context. If none are selected, all indexed documents are queried.
                    </p>

                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                        {readyDocuments.length === 0 ? (
                            <p className="text-xs text-[#67788A] py-3 text-center">
                                No processed documents available. Upload documents first to scope queries.
                            </p>
                        ) : (
                            readyDocuments.map((doc) => {
                                const isChecked = selectedDocIds.includes(doc.id);
                                return (
                                    <label
                                        key={doc.id}
                                        className={cn(
                                            'flex items-center gap-2.5 rounded-xl p-2 text-xs transition cursor-pointer',
                                            isChecked
                                                ? 'bg-[#F4EAEB] text-[#8C221A] font-semibold'
                                                : 'text-[#34424F] hover:bg-[#F3F5F7]',
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => toggleDocumentSelection(doc.id)}
                                            className="rounded border-[#D5DBE2] text-[#8C221A] focus:ring-[#8C221A]/20"
                                        />
                                        <span className="truncate">{doc.fileName}</span>
                                    </label>
                                );
                            })
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
                        className="w-full resize-none rounded-xl border border-[#D5DBE2] bg-[#F8FAFC] px-4 py-3 pr-28 text-sm text-[#121921] placeholder-[#96A3B2] focus:border-[#8C221A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8C221A]/15 transition"
                    />

                    <div className="absolute right-3 flex items-center gap-2">
                        <Magnet padding={25} magnetStrength={2} maxOffset={4}>
                            <button
                                ref={buttonRef}
                                type="button"
                                onClick={() => setShowFilterDropdown((prev) => !prev)}
                                title="Scope search to specific documents"
                                className={cn(
                                    'btn-tactile-secondary flex items-center gap-1.5 rounded-lg p-2 text-xs font-semibold cursor-pointer',
                                    selectedDocIds.length > 0 || showFilterDropdown
                                        ? 'bg-[#F4EAEB] text-[#8C221A] border border-[#8C221A]/30 shadow-xs'
                                        : 'text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#121921]',
                                )}
                            >
                                <Files className="h-4 w-4" />
                                {selectedDocIds.length > 0 && (
                                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8C221A] px-1 text-[10px] font-bold text-white">
                                        {selectedDocIds.length}
                                    </span>
                                )}
                            </button>
                        </Magnet>

                        {isStreaming ? (
                            <Magnet padding={25} magnetStrength={2} maxOffset={4}>
                                <button
                                    type="button"
                                    onClick={onStopStreaming}
                                    title="Stop generation"
                                    className="btn-tactile rounded-lg bg-rose-600 p-2 text-white hover:bg-rose-500 cursor-pointer shadow-xs"
                                >
                                    <Square className="h-4 w-4 fill-current" />
                                </button>
                            </Magnet>
                        ) : (
                            <Magnet padding={30} magnetStrength={2.5} maxOffset={5} disabled={!content.trim()}>
                                <button
                                    type="submit"
                                    disabled={!content.trim()}
                                    title="Send question"
                                    className="btn-tactile rounded-lg bg-[#8C221A] p-2 text-white hover:bg-[#731A13] disabled:opacity-40 cursor-pointer shadow-xs disabled:pointer-events-none"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </Magnet>
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