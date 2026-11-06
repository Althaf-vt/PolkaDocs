import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { AppException } from '../../../common/errors/app.exception';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new AppException(
                'AUTH_TOKEN_INVALID',
                'Authorization token is missing',
                HttpStatus.UNAUTHORIZED,
            );
        }

        try {
            const secret = this.configService.get<string>('jwt.accessSecret');
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
                secret,
            });

            // Attach authenticated identity to request context
            request.user = {
                id: payload.sub,
                email: payload.email,
            };
        } catch {
            throw new AppException(
                'AUTH_TOKEN_INVALID',
                'Authorization token is invalid or expired',
                HttpStatus.UNAUTHORIZED,
            );
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | null {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return null;
        }

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' && token ? token : null;
    }
}