import { RetrievedChunk } from "../interfaces/retrieved-chunk.interface";

export const RETRIEVER = Symbol('RETRIEVER');

export interface RetrieveParams {
    userId: string;
    query: string;
    topK?: number;
    minScore?: number;
    documentIds?: string[];
}

export interface Retriever {
    retrieve(params: RetrieveParams): Promise<RetrievedChunk[]>;
}