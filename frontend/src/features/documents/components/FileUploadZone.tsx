import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { documentsApi } from '../../../api/documents.api';

interface FileUploadZoneProps {
    onUploadSuccess: () => void;
}

export function FileUploadZone({ onUploadSuccess }: FileUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const allowedExtensions = ['.pdf', '.docx', '.txt', '.md'];

    const validateAndUpload = async (file: File) => {
        setErrorMessage(null);
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;

        if (!allowedExtensions.includes(extension)) {
            setErrorMessage(`Unsupported format. Accepted: ${allowedExtensions.join(', ')}`);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setErrorMessage('File size exceeds the 10 MB maximum limit');
            return;
        }

        setIsUploading(true);
        try {
            await documentsApi.upload(file);
            onUploadSuccess();
        } catch (err: unknown) {
            const message =
                typeof err === 'object' && err !== null && 'response' in err
                    ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                    : 'Failed to upload document.';
            setErrorMessage(message || 'An error occurred during file upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await validateAndUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await validateAndUpload(e.target.files[0]);
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition cursor-pointer ${isDragging
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                {isUploading ? (
                    <div className="flex flex-col items-center space-y-2 text-indigo-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-sm font-medium">Uploading and scheduling ingestion...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-2 text-slate-400">
                        <UploadCloud className="h-8 w-8 text-slate-500" />
                        <div>
                            <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-xs text-slate-500">PDF, DOCX, TXT, or MD (Max 10 MB)</p>
                    </div>
                )}
            </div>

            {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}
        </div>
    );
}