import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger, } from '@nestjs/common';
import { Response } from 'express';
import { AppException, AppErrorResponse } from '../errors/app.exception';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AppExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let responsePayload: AppErrorResponse;

        if (exception instanceof AppException) {
            status = exception.getStatus();
            responsePayload = exception.getResponse() as AppErrorResponse;
        } else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            // Standardize class-validator payloads from ValidationPipe
            if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null &&
                'message' in exceptionResponse
            ) {
                const details = exceptionResponse as Record<string, unknown>;
                const rawMessage = details.message;

                responsePayload = {
                    error: {
                        code: status === HttpStatus.BAD_REQUEST ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
                        message: Array.isArray(rawMessage) ? rawMessage.join('; ') : String(rawMessage),
                        details,
                    },
                };
            } else {
                responsePayload = {
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: exception.message,
                        details: {},
                    },
                };
            }
        } else {
            // Log stack trace for unexpected errors without leaking internals to client
            this.logger.error('Unhandled internal exception captured:', exception);

            responsePayload = {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected internal error occurred',
                    details: {},
                },
            };
        }

        response.status(status).json(responsePayload);
    }
}