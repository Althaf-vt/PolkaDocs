import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChunkResult } from '../interfaces/chunk-result.interface';

@Injectable()
export class ChunkerService {
    private readonly defaultChunkSize: number;
    private readonly defaultChunkOverlap: number;

    constructor(private readonly configService: ConfigService) {
        this.defaultChunkSize =
            this.configService.get<number>('rag.chunkSize') || 900;
        this.defaultChunkOverlap =
            this.configService.get<number>('rag.chunkOverlap') || 120;
    }

    // Slices cleaned text into overlapping chunks, attempting natural break points
    chunkText(
        text: string,
        baseMetadata: Record<string, unknown> = {},
        chunkSize: number = this.defaultChunkSize,
        chunkOverlap: number = this.defaultChunkOverlap,
    ): ChunkResult[] {
        const trimmedText = text.trim();
        if (!trimmedText) {
            return [];
        }

        if (trimmedText.length <= chunkSize) {
            return [
                {
                    chunkIndex: 0,
                    content: trimmedText,
                    metadata: { ...baseMetadata },
                },
            ];
        }

        const chunks: ChunkResult[] = [];
        let startIndex = 0;
        let chunkIndex = 0;

        while (startIndex < trimmedText.length) {
            let endIndex = Math.min(startIndex + chunkSize, trimmedText.length);

            // Search for natural break points within the overlap window if not at the end of text
            if (endIndex < trimmedText.length) {
                const lookbackStart = Math.max(startIndex, endIndex - chunkOverlap);
                const lookbackWindow = trimmedText.slice(lookbackStart, endIndex);

                // Check for paragraph, newline, sentence, or word boundaries
                const paragraphBreak = lookbackWindow.lastIndexOf('\n\n');
                const newlineBreak = lookbackWindow.lastIndexOf('\n');
                const sentenceBreak = lookbackWindow.lastIndexOf('. ');
                const spaceBreak = lookbackWindow.lastIndexOf(' ');

                let bestOffset = -1;
                if (paragraphBreak !== -1) {
                    bestOffset = paragraphBreak + 2;
                } else if (newlineBreak !== -1) {
                    bestOffset = newlineBreak + 1;
                } else if (sentenceBreak !== -1) {
                    bestOffset = sentenceBreak + 2;
                } else if (spaceBreak !== -1) {
                    bestOffset = spaceBreak + 1;
                }

                if (bestOffset !== -1) {
                    const breakPosition = lookbackStart + bestOffset;
                    if (breakPosition > startIndex) {
                        endIndex = breakPosition;
                    }
                }
            }

            const chunkContent = trimmedText.slice(startIndex, endIndex).trim();

            if (chunkContent.length > 0) {
                chunks.push({
                    chunkIndex,
                    content: chunkContent,
                    metadata: {
                        ...baseMetadata,
                        charLength: chunkContent.length,
                    },
                });
                chunkIndex += 1;
            }

            if (endIndex >= trimmedText.length) {
                break;
            }

            // Advance start index ensuring forward progress
            const nextStart = endIndex - chunkOverlap;
            startIndex = nextStart > startIndex ? nextStart : endIndex;
        }

        return chunks;
    }
}