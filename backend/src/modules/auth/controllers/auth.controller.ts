import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, CookieOptions } from 'express';
import { AuthService } from '../services/auth.service';
import type { AuthUserPayload } from '../interfaces/auth-tokens.interface';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { AppException } from '../../../common/errors/app.exception';
import { parseDurationToMs } from '../../../common/utils/time.util';

const REFRESH_COOKIE_NAME = 'refreshToken';

export interface AuthClientResponse {
    accessToken: string;
    user: AuthUserPayload;
}

@Controller('auth')
export class AuthController {
    private readonly cookieOptions: CookieOptions;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        const isProd = this.configService.get<string>('environment') === 'production';
        const refreshTtl = this.configService.get<string>('jwt.refreshTtl') || '7d';

        this.cookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
            path: '/api/v1/auth',
            maxAge: parseDurationToMs(refreshTtl),
        };
    }

    @Public()
    @Post('register')
    async register(
        @Body() registerDto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthClientResponse> {
        const result = await this.authService.register(registerDto);
        res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, this.cookieOptions);
        return {
            accessToken: result.accessToken,
            user: result.user,
        };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthClientResponse> {
        const result = await this.authService.login(loginDto);
        res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, this.cookieOptions);
        return {
            accessToken: result.accessToken,
            user: result.user,
        };
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthClientResponse> {
        const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
        const tokenFromBody = req.body?.refreshToken;
        const refreshToken = tokenFromCookie || tokenFromBody;

        if (!refreshToken) {
            throw new AppException(
                'AUTH_TOKEN_INVALID',
                'Refresh token is missing from request cookies or body',
                HttpStatus.UNAUTHORIZED,
            );
        }

        const result = await this.authService.refresh(refreshToken);
        res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, this.cookieOptions);
        return {
            accessToken: result.accessToken,
            user: result.user,
        };
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<void> {
        const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
        const tokenFromBody = req.body?.refreshToken;
        const refreshToken = tokenFromCookie || tokenFromBody;

        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        res.clearCookie(REFRESH_COOKIE_NAME, {
            ...this.cookieOptions,
            maxAge: 0,
        });
    }
}