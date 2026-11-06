export interface ChunkResult {
    chunkIndex: number;
    content: string;
    metadata: Record<string, unknown>;
}