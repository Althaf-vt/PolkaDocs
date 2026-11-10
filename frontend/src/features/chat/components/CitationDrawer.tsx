import { X, FileText, Bookmark } from 'lucide-react';
import type { Citation } from '../../../types/chat.types';

interface CitationDrawerProps {
    isOpen: boolean;
    citation: Citation | null;
    citationIndex: number | null;
    onClose: () => void;
}

export function CitationDrawer({
    isOpen,
    citation,
    citationIndex,
    onClose,
}: CitationDrawerProps) {
    if (!isOpen || !citation) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#121921]/20 backdrop-blur-xs">
            <div className="relative flex h-full w-full max-w-md flex-col border-l border-[#D5DBE2] bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#E5E9EE] pb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F4EAEB] text-xs font-bold text-[#8C221A] border border-[#8C221A]/20">
                            {citationIndex !== null ? citationIndex + 1 : ''}
                        </span>
                        <h3 className="text-sm font-bold text-[#121921]">Source Citation</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#121921] transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#67788A]">
                            Document Reference
                        </span>
                        <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#E5E9EE] bg-[#F8FAFC] p-3 text-xs text-[#34424F] font-mono">
                            <FileText className="h-4 w-4 shrink-0 text-[#8C221A]" />
                            <span className="truncate">{citation.documentId}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#67788A]">
                            Chunk ID
                        </span>
                        <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#E5E9EE] bg-[#F8FAFC] p-3 text-xs text-[#67788A] font-mono">
                            <Bookmark className="h-4 w-4 shrink-0 text-[#67788A]" />
                            <span className="truncate">{citation.chunkId}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#67788A]">
                            Retrieved Context Snippet
                        </span>
                        <div className="mt-2 rounded-lg border-l-4 border-l-[#8C221A] border-y border-r border-[#E5E9EE] bg-[#F8FAFC] p-4 text-xs leading-relaxed text-[#121921] whitespace-pre-wrap font-sans">
                            {citation.snippet}
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#E5E9EE] pt-4">
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg bg-[#EAEEF2] py-2.5 text-xs font-semibold text-[#121921] hover:bg-[#D5DBE2] transition cursor-pointer"
                    >
                        Close Inspector
                    </button>
                </div>
            </div>
        </div>
    );
}