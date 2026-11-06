export interface ScoredChunk {
    id: string;
    documentId: string;
    chunkIndex: number;
    content: string;
    metadata: Record<string, unknown>;
    similarity: number;
}