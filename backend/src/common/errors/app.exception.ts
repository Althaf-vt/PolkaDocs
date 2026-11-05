import { HttpException, HttpStatus } from '@nestjs/common';

// Application error code union type
export type AppErrorCode =
    | 'VALIDATION_ERROR'
    | 'AUTH_INVALID_CREDENTIALS'
    | 'AUTH_TOKEN_INVALID'
    | 'DOCUMENT_NOT_FOUND'
    | 'DOCUMENT_UNSUPPORTED_TYPE'
    | 'DOCUMENT_TOO_LARGE'
    | 'DOCUMENT_NOT_READY'
    | 'CONVERSATION_NOT_FOUND'
    | 'LLM_RATE_LIMITED'
    | 'LLM_UNAVAILABLE'
    | 'INTERNAL_ERROR';

// Structured error response contract
export interface AppErrorResponse {
    error: {
        code: AppErrorCode;
        message: string;
        details: Record<string, unknown>;
    };
}

// Base application exception mapping domain codes to HTTP status
export class AppException extends HttpException {
    public readonly code: AppErrorCode;
    public readonly details: Record<string, unknown>;

    constructor(
        code: AppErrorCode,
        message: string,
        status: HttpStatus,
        details: Record<string, unknown> = {},
    ) {
        const responsePayload: AppErrorResponse = {
            error: {
                code,
                message,
                details,
            },
        };

        super(responsePayload, status);
        this.code = code;
        this.details = details;
    }
}