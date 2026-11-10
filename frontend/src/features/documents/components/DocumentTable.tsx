import { useState } from 'react';
import type { DocumentItem, DocumentStatus } from '../../../types/document.types';
import { formatBytes, formatDate } from '../../../lib/utils';
import {
    FileText,
    Trash2,
    RotateCw,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface DocumentTableProps {
    documents: DocumentItem[];
    onReprocess: (id: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

// Renders the status badge with contextual icon and color
function StatusBadge({ status }: { status: DocumentStatus }) {
    switch (status) {
        case 'ready':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                </span>
            );
        case 'processing':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                    <Loader2 className="h-3 w-3 animate-spin" /> Processing
                </span>
            );
        case 'failed':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-800 border border-red-200">
                    <AlertTriangle className="h-3 w-3" /> Failed
                </span>
            );
        case 'uploaded':
        default:
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                    <Clock className="h-3 w-3" /> Uploaded
                </span>
            );
    }
}

// Data table listing ingested documents and lifecycle controls
export function DocumentTable({ documents, onReprocess, onDelete }: DocumentTableProps) {
    const [pendingAction, setPendingAction] = useState<{
        type: 'reprocess' | 'delete';
        document: DocumentItem;
    } | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const handleConfirm = async () => {
        if (!pendingAction) return;
        setIsActionLoading(true);
        try {
            if (pendingAction.type === 'delete') {
                await onDelete(pendingAction.document.id);
            } else {
                await onReprocess(pendingAction.document.id);
            }
            setPendingAction(null);
        } catch {
            // Error handling handled by caller mutation
        } finally {
            setIsActionLoading(false);
        }
    };

    if (documents.length === 0) {
        return (
            <div className="rounded-2xl border border-[#D5DBE2] bg-white p-12 text-center text-[#67788A] shadow-xs">
                <FileText className="mx-auto h-8 w-8 text-[#96A3B2] mb-2" />
                <p className="text-sm font-medium">No documents uploaded yet. Upload a file above to begin.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-[#D5DBE2] bg-white shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#34424F]">
                    <thead className="border-b border-[#D5DBE2] bg-[#F3F5F7] text-xs font-bold uppercase tracking-wider text-[#67788A]">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Size</th>
                            <th className="px-6 py-4">Uploaded</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E9EE]">
                        {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-[#F3F5F7]/80 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-[#F4EAEB] p-2 text-[#8C221A]">
                                            <FileText className="h-4 w-4 shrink-0" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#121921] truncate max-w-xs">{doc.fileName}</p>
                                            {doc.failureReason && (
                                                <p className="text-xs text-red-600 truncate max-w-xs">{doc.failureReason}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={doc.status} />
                                </td>
                                <td className="px-6 py-4 text-[#67788A] font-medium text-xs">
                                    {formatBytes(Number(doc.sizeBytes))}
                                </td>
                                <td className="px-6 py-4 text-[#67788A] text-xs font-medium">
                                    {formatDate(doc.createdAt)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button
                                            onClick={() => setPendingAction({ type: 'reprocess', document: doc })}
                                            title="Reprocess document"
                                            className="rounded-lg p-1.5 text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#121921] transition cursor-pointer"
                                        >
                                            <RotateCw className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setPendingAction({ type: 'delete', document: doc })}
                                            title="Delete document"
                                            className="rounded-lg p-1.5 text-[#67788A] hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={pendingAction !== null}
                title={
                    pendingAction?.type === 'delete'
                        ? 'Delete Document'
                        : 'Reprocess Document'
                }
                description={
                    pendingAction?.type === 'delete' ? (
                        <span>
                            Are you sure you want to delete <strong className="text-[#121921] font-semibold">{pendingAction.document.fileName}</strong>? This will permanently remove the document, its parsed chunks, and all vector embeddings from the search index. This action cannot be undone.
                        </span>
                    ) : (
                        <span>
                            Are you sure you want to reprocess <strong className="text-[#121921] font-semibold">{pendingAction?.document.fileName}</strong>? This will clear existing chunks and re-run parsing, extraction, and vector embedding generation.
                        </span>
                    )
                }
                confirmText={pendingAction?.type === 'delete' ? 'Delete Document' : 'Reprocess'}
                cancelText="Cancel"
                variant={pendingAction?.type === 'delete' ? 'danger' : 'primary'}
                icon={
                    pendingAction?.type === 'delete' ? (
                        <Trash2 className="h-5 w-5" />
                    ) : (
                        <RotateCw className="h-5 w-5" />
                    )
                }
                isLoading={isActionLoading}
                onConfirm={handleConfirm}
                onCancel={() => !isActionLoading && setPendingAction(null)}
            />
        </div>
    );
}
