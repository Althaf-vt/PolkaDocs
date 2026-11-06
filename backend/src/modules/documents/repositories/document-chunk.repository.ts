import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DocumentChunk } from '../entities/document-chunk.entity';
import { RetrievedChunk } from '../interfaces/retrieved-chunk.interface';

@Injectable()
export class DocumentChunkRepository extends Repository<DocumentChunk> {
    constructor(private readonly dataSource: DataSource) {
        super(DocumentChunk, dataSource.createEntityManager());
    }

    // Inserts a chunk record with a pgvector literal
    async insertChunkWithVector(
        documentId: string,
        userId: string,
        chunkIndex: number,
        content: string,
        metadata: Record<string, unknown>,
        embedding: number[],
    ): Promise<void> {
        const vectorString = `[${embedding.join(',')}]`;

        await this.query(
            `
      INSERT INTO document_chunks (
        id, document_id, user_id, chunk_index, content, metadata, embedding
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6::vector
      )
      `,
            [documentId, userId, chunkIndex, content, JSON.stringify(metadata), vectorString],
        );
    }

    // Finds nearest chunks using cosine similarity scoped by user and optional document list
    async searchCosineSimilarity(
        userId: string,
        queryEmbedding: number[],
        topK: number,
        minScore: number,
        documentIds?: string[],
    ): Promise<RetrievedChunk[]> {
        const vectorString = `[${queryEmbedding.join(',')}]`;

        let sql = `
      SELECT
        id,
        document_id AS "documentId",
        chunk_index AS "chunkIndex",
        content,
        metadata,
        1 - (embedding <=> $1::vector) AS similarity
      FROM document_chunks
      WHERE user_id = $2
    `;

        const params: (string | number | string[])[] = [vectorString, userId];

        if (documentIds && documentIds.length > 0) {
            params.push(documentIds);
            sql += ` AND document_id = ANY($${params.length})`;
        }

        params.push(minScore);
        sql += ` AND (1 - (embedding <=> $1::vector)) >= $${params.length}`;

        params.push(topK);
        sql += ` ORDER BY similarity DESC LIMIT $${params.length}`;

        return this.query(sql, params);
    }
}