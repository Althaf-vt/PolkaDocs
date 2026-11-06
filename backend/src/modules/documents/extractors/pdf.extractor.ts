import { PDFParse } from 'pdf-parse';
import { ExtractedDocument } from '../interfaces/extracted-document.interface';

export class PdfExtractor {
  async extract(buffer: Buffer): Promise<ExtractedDocument> {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();

      return {
        text: result.text || '',
        metadata: {
          pageCount: result.total,
        },
      };
    } finally {
      await parser.destroy(); // releases worker memory
    }
  }
}