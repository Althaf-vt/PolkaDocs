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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-900 p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400 border border-indigo-500/30">
                            {citationIndex !== null ? citationIndex + 1 : ''}
                        </span>
                        <h3 className="text-sm font-semibold text-white">Source Citation</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Document Reference
                        </span>
                        <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300 font-mono">
                            <FileText className="h-4 w-4 shrink-0 text-indigo-400" />
                            <span className="truncate">{citation.documentId}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Chunk ID
                        </span>
                        <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300 font-mono">
                            <Bookmark className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="truncate">{citation.chunkId}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Retrieved Context Snippet
                        </span>
                        <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
                            {citation.snippet}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                    >
                        Close Inspector
                    </button>
                </div>
            </div>
        </div>
    );
}