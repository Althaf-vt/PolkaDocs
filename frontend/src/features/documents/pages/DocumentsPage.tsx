import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../../../api/documents.api';
import { FileUploadZone } from '../components/FileUploadZone';
import { DocumentTable } from '../components/DocumentTable';

export function DocumentsPage() {
    const queryClient = useQueryClient();

    // Query documents with dynamic polling if any file is in progress
    const { data, isLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: () => documentsApi.getAll(1, 50),
        refetchInterval: (query) => {
            const documents = query.state.data?.items ?? [];
            const hasActiveWork = documents.some(
                (doc) => doc.status === 'processing' || doc.status === 'uploaded',
            );
            // Poll every 3 seconds while ingestion pipelines run, else pause
            return hasActiveWork ? 3000 : false;
        },
    });

    // Reprocess mutation
    const reprocessMutation = useMutation({
        mutationFn: (id: string) => documentsApi.reprocess(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => documentsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Document Management</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Upload documents to index them into your vector knowledge base.
                </p>
            </div>

            <FileUploadZone
                onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ['documents'] })}
            />

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Uploaded Files</h2>
                {isLoading ? (
                    <div className="h-32 flex items-center justify-center text-slate-500">
                        Loading documents...
                    </div>
                ) : (
                    <DocumentTable
                        documents={data?.items ?? []}
                        onReprocess={async (id) => {
                            await reprocessMutation.mutateAsync(id);
                        }}
                        onDelete={async (id) => {
                            await deleteMutation.mutateAsync(id);
                        }}
                    />
                )}
            </div>
        </div>
    );
}