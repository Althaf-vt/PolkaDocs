import { ExtractedDocument } from '../interfaces/extracted-document.interface';

export class MarkdownExtractor {
  async extract(buffer: Buffer): Promise<ExtractedDocument> {
    const text = buffer.toString('utf-8');

    return {
      text,
      metadata: {},
    };
  }
}