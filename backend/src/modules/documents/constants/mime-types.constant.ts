export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
] as const;

export type SupportedMimeType = typeof SUPPORTED_MIME_TYPES[number];