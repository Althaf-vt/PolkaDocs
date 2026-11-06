import * as mammoth from 'mammoth';
import { ExtractedDocument } from '../interfaces/extracted-document.interface';


export class DocxExtractor {
  async extract(buffer: Buffer): Promise<ExtractedDocument> {
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value || '',
      metadata: {},
    };
  }
}