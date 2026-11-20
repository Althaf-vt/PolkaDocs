import { useEffect, useState, useCallback } from 'react';
import { X, FileText, Bookmark } from 'lucide-react';
import type { Citation } from '../../../types/chat.types';
import { cn } from '../../../lib/utils';

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
    const [isRendered, setIsRendered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [activeCitation, setActiveCitation] = useState<Citation | null>(citation);
    const [activeIndex, setActiveIndex] = useState<number | null>(citationIndex);

    // Sync active data and manage in/out animation lifecycle
    useEffect(() => {
        if (isOpen && citation) {
            setActiveCitation(citation);
            setActiveIndex(citationIndex);
            setIsRendered(true);

            // Double frame tick ensures initial translate-x-full is registered before transition
            const raf1 = requestAnimationFrame(() => {
                const raf2 = requestAnimationFrame(() => {
                    setIsVisible(true);
                });
                return () => cancelAnimationFrame(raf2);
            });
            return () => cancelAnimationFrame(raf1);
        } else if (!isOpen && isRendered) {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setIsRendered(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, citation, citationIndex, isRendered]);

    // Smooth exit handler before informing parent
    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            setIsRendered(false);
            onClose();
        }, 300);
    }, [onClose]);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isVisible) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, handleClose]);

    if (!isRendered || !activeCitation) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
            {/* Backdrop with fade in / out animation and outside click dismiss */}
            <div
                className={cn(
                    'fixed inset-0 bg-[#121921]/30 backdrop-blur-xs transition-opacity duration-300 ease-in-out',
                    isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
                )}
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Sliding drawer panel with slide in / out animation */}
            <div
                className={cn(
                    'relative z-10 flex h-full w-full max-w-md flex-col border-l border-[#D5DBE2] bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out',
                    isVisible ? 'translate-x-0' : 'translate-x-full',
                )}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Source Citation"
            >
                <div className="flex items-center justify-between border-b border-[#E5E9EE] pb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F4EAEB] text-xs font-bold text-[#8C221A] border border-[#8C221A]/20">
                            {activeIndex !== null ? activeIndex + 1 : ''}
                        </span>
                        <h3 className="text-sm font-bold text-[#121921]">Source Citation</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-lg p-1 text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#121921] transition cursor-pointer"
                        title="Close Inspector"
                        aria-label="Close Inspector"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 flex-1 space-y-4 overflow-y-auto no-scrollbar">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#67788A]">
                            Document Reference
                        </span>
                        <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#E5E9EE] bg-[#F8FAFC] p-3 text-xs text-[#34424F] font-mono">
                            <FileText className="h-4 w-4 shrink-0 text-[#8C221A]" />
                            <span className="truncate">{activeCitation.documentId}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#67788A]">
                            Reference ID
                        </span>
                        <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#E5E9EE] bg-[#F8FAFC] p-3 text-xs text-[#67788A] font-mono">
                            <Bookmark className="h-4 w-4 shrink-0 text-[#67788A]" />
                            <span className="truncate">{activeCitation.chunkId}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#67788A]">
                            Document Excerpt
                        </span>
                        <div className="mt-2 rounded-lg border-l-4 border-l-[#8C221A] border-y border-r border-[#E5E9EE] bg-[#F8FAFC] p-4 text-xs leading-relaxed text-[#121921] whitespace-pre-wrap font-sans">
                            {activeCitation.snippet}
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#E5E9EE] pt-4">
                    <button
                        onClick={handleClose}
                        className="w-full rounded-lg bg-[#EAEEF2] py-2.5 text-xs font-semibold text-[#121921] hover:bg-[#D5DBE2] transition cursor-pointer"
                    >
                        Close Inspector
                    </button>
                </div>
            </div>
        </div>
    );
}
