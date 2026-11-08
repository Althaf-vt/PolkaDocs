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
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                </span>
            );
        case 'processing':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
                    <Loader2 className="h-3 w-3 animate-spin" /> Processing
                </span>
            );
        case 'failed':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="h-3 w-3" /> Failed
                </span>
            );
        case 'uploaded':
        default:
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/20">
                    <Clock className="h-3 w-3" /> Uploaded
                </span>
            );
    }
}

// Data table listing ingested documents and lifecycle controls
export function DocumentTable({ documents, onReprocess, onDelete }: DocumentTableProps) {
    if (documents.length === 0) {
        return (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
                <FileText className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                <p className="text-sm">No documents uploaded yet. Upload a file above to begin.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Size</th>
                            <th className="px-6 py-4">Uploaded</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                        {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 shrink-0 text-indigo-400" />
                                        <div>
                                            <p className="font-medium text-white truncate max-w-xs">{doc.fileName}</p>
                                            {doc.failureReason && (
                                                <p className="text-xs text-rose-400 truncate max-w-xs">{doc.failureReason}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={doc.status} />
                                </td>
                                <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                    {formatBytes(Number(doc.sizeBytes))}
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-xs">
                                    {formatDate(doc.createdAt)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onReprocess(doc.id)}
                                            title="Reprocess document"
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                                        >
                                            <RotateCw className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(doc.id)}
                                            title="Delete document"
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition"
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
        </div>
    );
}