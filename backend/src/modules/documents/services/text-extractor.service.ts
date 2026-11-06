import { Injectable, HttpStatus } from '@nestjs/common';
import { PdfExtractor } from '../extractors/pdf.extractor';
import { DocxExtractor } from '../extractors/docx.extractor';
import { TxtExtractor } from '../extractors/txt.extractor';
import { MarkdownExtractor } from '../extractors/markdown.extractor';
import { ExtractedDocument } from '../interfaces/extracted-document.interface';
import { SupportedMimeType } from '../constants/mime-types.constant';
import { AppException } from '../../../common/errors/app.exception';


@Injectable()
export class TextExtractorService {
    private readonly pdfExtractor = new PdfExtractor();
    private readonly docxExtractor = new DocxExtractor();
    private readonly txtExtractor = new TxtExtractor();
    private readonly markdownExtractor = new MarkdownExtractor();

    // Resolves the correct extractor, extracts raw text, and sanitizes characters
    async extractText(buffer: Buffer, mimeType: SupportedMimeType): Promise<ExtractedDocument> {
        let result: ExtractedDocument;

        switch (mimeType) {
            case 'application/pdf':
                result = await this.pdfExtractor.extract(buffer);
                break;

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                result = await this.docxExtractor.extract(buffer);
                break;

            case 'text/plain':
                result = await this.txtExtractor.extract(buffer);
                break;

            case 'text/markdown':
            case 'text/x-markdown':
                result = await this.markdownExtractor.extract(buffer);
                break;

            default:
                throw new AppException(
                    'DOCUMENT_UNSUPPORTED_TYPE',
                    `Unsupported file MIME type: ${mimeType}`,
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                );
        }

        return {
            text: this.cleanText(result.text),
            metadata: result.metadata,
        };
    }

    // Normalizes carriage returns, cleans null bytes, and trims redundant whitespace
    private cleanText(rawText: string): string {
        return rawText
            // Replace null bytes
            .replace(/\0/g, '')
            // Normalize Windows CRLF to standard LF
            .replace(/\r\n/g, '\n')
            // Normalize classic Mac CR to standard LF
            .replace(/\r/g, '\n')
            // Replace non-breaking spaces with standard space
            .replace(/\u00A0/g, ' ')
            // Collapse 3 or more consecutive newlines into double newlines
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
}