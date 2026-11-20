import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan, LessThanOrEqual } from 'typeorm';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AppException } from '../../../common/errors/app.exception';
import { parseDurationToMs } from '../../../common/utils/time.util';
import { PasswordService } from './password.service';
import { AuthTokens } from '../interfaces/auth-tokens.interface';

// Allow a 15-second grace window for rotated tokens to tolerate in-flight race conditions
const ROTATION_GRACE_WINDOW_MS = 15000;

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

        return this.generateTokenPair(user.id, user.email, user.name, user.createdAt, user.updatedAt);
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

        return this.generateTokenPair(user.id, user.email, user.name, user.createdAt, user.updatedAt);
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

        // Retrieve active, unexpired tokens for the user sorted newest first
        const activeTokens = await this.refreshTokenRepository.find({
            where: {
                userId: payload.sub,
                revokedAt: IsNull(),
                expiresAt: MoreThan(new Date()),
            },
            order: {
                createdAt: 'DESC',
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

        if (!matchedTokenRecord) {
            // Check if the presented token was rotated within the allowed grace period (15s)
            // to tolerate legitimate in-flight concurrent requests during page load or network retries
            const graceThreshold = new Date(Date.now() - ROTATION_GRACE_WINDOW_MS);
            const recentlyRevokedTokens = await this.refreshTokenRepository.find({
                where: {
                    userId: payload.sub,
                    revokedAt: MoreThan(graceThreshold),
                    expiresAt: MoreThan(new Date()),
                },
                order: {
                    revokedAt: 'DESC',
                },
            });

            for (const record of recentlyRevokedTokens) {
                const isMatch = await this.passwordService.compare(refreshTokenRaw, record.tokenHash);
                if (isMatch) {
                    const user = await this.usersService.findById(payload.sub);
                    return this.generateTokenPair(user.id, user.email, user.name, user.createdAt, user.updatedAt);
                }
            }

            throw new AppException(
                'AUTH_TOKEN_INVALID',
                'Refresh token has been revoked or expired',
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (matchedTokenRecord.expiresAt < new Date()) {
            throw new AppException(
                'AUTH_TOKEN_INVALID',
                'Refresh token has been revoked or expired',
                HttpStatus.UNAUTHORIZED,
            );
        }

        // Revoke old refresh token (rotation)
        matchedTokenRecord.revokedAt = new Date();
        await this.refreshTokenRepository.save(matchedTokenRecord);

        const user = await this.usersService.findById(payload.sub);
        return this.generateTokenPair(user.id, user.email, user.name, user.createdAt, user.updatedAt);
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
                    expiresAt: MoreThan(new Date()),
                },
                order: {
                    createdAt: 'DESC',
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

    private async generateTokenPair(
        userId: string,
        email: string,
        name: string | null = null,
        createdAt?: Date | string,
        updatedAt?: Date | string,
    ): Promise<AuthTokens> {
        const accessSecret = this.configService.get<string>('jwt.accessSecret');
        const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
        const accessTtl = this.configService.get<string>('jwt.accessTtl') || '15m';
        const refreshTtl = this.configService.get<string>('jwt.refreshTtl') || '7d';

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

        const expiresAt = new Date(Date.now() + parseDurationToMs(refreshTtl));

        // Revoke expired tokens for the user to maintain a compact search space
        await this.refreshTokenRepository.update(
            {
                userId,
                revokedAt: IsNull(),
                expiresAt: LessThanOrEqual(new Date()),
            },
            {
                revokedAt: new Date(),
            },
        );

        const tokenRecord = this.refreshTokenRepository.create({
            userId,
            tokenHash,
            expiresAt,
        });
        await this.refreshTokenRepository.save(tokenRecord);

        return {
            accessToken,
            refreshToken,
            user: {
                id: userId,
                email,
                name,
                createdAt,
                updatedAt,
            },
        };
    }
}