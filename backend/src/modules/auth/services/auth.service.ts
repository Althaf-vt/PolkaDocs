import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AppException } from '../../../common/errors/app.exception';
import { PasswordService } from './password.service';
import { AuthTokens } from '../interfaces/auth-tokens.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly passwordService: PasswordService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto): Promise<AuthTokens> {
        const existing = await this.usersService.findByEmail(registerDto.email);
        if (existing) {
            throw new AppException(
                'VALIDATION_ERROR',
                'An account with this email already exists',
                HttpStatus.CONFLICT,
            );
        }

        const passwordHash = await this.passwordService.hash(registerDto.password);
        const user = await this.usersService.create(
            registerDto.email,
            passwordHash,
            registerDto.name,
        );

        return this.generateTokenPair(user.id, user.email);
    }

    async login(loginDto: LoginDto): Promise<AuthTokens> {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new AppException(
                'AUTH_INVALID_CREDENTIALS',
                'Invalid email or password',
                HttpStatus.UNAUTHORIZED,
            );
        }

        const passwordMatches = await this.passwordService.compare(
            loginDto.password,
            user.passwordHash,
        );
        if (!passwordMatches) {
            throw new AppException(
                'AUTH_INVALID_CREDENTIALS',
                'Invalid email or password',
                HttpStatus.UNAUTHORIZED,
            );
        }

        return this.generateTokenPair(user.id, user.email);
    }

    async refresh(refreshTokenRaw: string): Promise<AuthTokens> {
        const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

        let payload: { sub: string; email: string };
        try {
            payload = await this.jwtService.verifyAsync(refreshTokenRaw, {
                secret: refreshSecret,
            });
        } catch {
            throw new AppException(
                'AUTH_TOKEN_INVALID',
                'Invalid or expired refresh token',
                HttpStatus.UNAUTHORIZED,
            );
        }

        // Retrieve active non-revoked tokens for the user
        const activeTokens = await this.refreshTokenRepository.find({
            where: {
                userId: payload.sub,
                revokedAt: IsNull(),
            },
        });

        let matchedTokenRecord: RefreshToken | null = null;
        for (const record of activeTokens) {
            const isMatch = await this.passwordService.compare(refreshTokenRaw, record.tokenHash);
            if (isMatch) {
                matchedTokenRecord = record;
                break;
            }
        }

        if (!matchedTokenRecord || matchedTokenRecord.expiresAt < new Date()) {
            throw new AppException(
                'AUTH_TOKEN_INVALID',
                'Refresh token has been revoked or expired',
                HttpStatus.UNAUTHORIZED,
            );
        }

        // Revoke old refresh token (rotation)
        matchedTokenRecord.revokedAt = new Date();
        await this.refreshTokenRepository.save(matchedTokenRecord);

        return this.generateTokenPair(payload.sub, payload.email);
    }

    async logout(refreshTokenRaw: string): Promise<void> {
        const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

        try {
            const payload = await this.jwtService.verifyAsync<{ sub: string }>(
                refreshTokenRaw,
                { secret: refreshSecret },
            );

            const activeTokens = await this.refreshTokenRepository.find({
                where: {
                    userId: payload.sub,
                    revokedAt: IsNull(),
                },
            });

            for (const record of activeTokens) {
                const isMatch = await this.passwordService.compare(refreshTokenRaw, record.tokenHash);
                if (isMatch) {
                    record.revokedAt = new Date();
                    await this.refreshTokenRepository.save(record);
                    break;
                }
            }
        } catch {
            // Gracefully finish logout even if the presented token is already invalid
        }
    }

    private async generateTokenPair(userId: string, email: string): Promise<AuthTokens> {
        const accessSecret = this.configService.get<string>('jwt.accessSecret');
        const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
        const accessTtl = this.configService.get<string>('jwt.accessTtl');
        const refreshTtl = this.configService.get<string>('jwt.refreshTtl');

        const accessToken = await this.jwtService.signAsync(
            { sub: userId, email },
            {
                secret: accessSecret,
                expiresIn: accessTtl as JwtSignOptions['expiresIn']
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            { sub: userId, email },
            {
                secret: refreshSecret,
                expiresIn: refreshTtl as JwtSignOptions['expiresIn']
            },
        );

        const tokenHash = await this.passwordService.hash(refreshToken);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const tokenRecord = this.refreshTokenRepository.create({
            userId,
            tokenHash,
            expiresAt,
        });
        await this.refreshTokenRepository.save(tokenRecord);

        return { accessToken, refreshToken };
    }
}