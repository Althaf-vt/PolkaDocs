export interface ExtractedDocument {
    text: string;
    metadata: {
        pageCount?: number;
        [key: string]: unknown;
    };
}