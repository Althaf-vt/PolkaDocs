import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Magnet } from '@/components/ui/magnet';

export interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    description: ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    icon?: ReactNode;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationModal({
    isOpen,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    icon,
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) {
                onCancel();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isLoading) {
                    onCancel();
                }
            }}
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-md rounded-2xl border border-[#D5DBE2] bg-white p-6 shadow-2xl transition-all">
                {/* Close 'X' Button */}
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="absolute right-4 top-4 rounded-lg p-1 text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#121921] transition cursor-pointer disabled:opacity-40"
                    aria-label="Close modal"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-4">
                    {icon && (
                        <div
                            className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs',
                                isDanger
                                    ? 'border-red-200 bg-red-50 text-red-600'
                                    : 'border-[#8C221A]/20 bg-[#F4EAEB] text-[#8C221A]',
                            )}
                        >
                            {icon}
                        </div>
                    )}

                    <div className="flex-1 pr-6">
                        <h3 className="text-base font-bold text-[#121921]">{title}</h3>
                        <div className="mt-2 text-xs leading-relaxed text-[#67788A]">
                            {description}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#E5E9EE] pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="btn-tactile-secondary rounded-xl border border-[#D5DBE2] bg-white px-4 py-2 text-xs font-semibold text-[#34424F] hover:bg-[#EAEEF2] hover:text-[#121921] shadow-xs cursor-pointer disabled:opacity-40"
                    >
                        {cancelText}
                    </button>
                    <Magnet padding={30} magnetStrength={2} maxOffset={4} disabled={isLoading}>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={cn(
                                'btn-tactile flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer disabled:opacity-50',
                                isDanger
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-[#8C221A] hover:bg-[#731A13]',
                            )}
                        >
                            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>{confirmText}</span>
                        </button>
                    </Magnet>
                </div>
            </div>
        </div>
    );
}

