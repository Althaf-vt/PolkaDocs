export type DocumentStatus = 'uploaded' | 'processing' | 'ready' | 'failed';

// Document entity representation on the client
export interface DocumentItem {
  id: string;
  userId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  status: DocumentStatus;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// Paginated documents API response contract
export interface PaginatedDocuments {
  items: DocumentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}