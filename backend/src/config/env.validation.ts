import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsIn, validateSync } from 'class-validator';

// Allowed runtime environments union type
export type NodeEnv = 'development' | 'production' | 'test';

// Allowed AI provider implementations union type
export type AiProvider = 'gemini' | 'langchain';

// Environment variable schema validation class
export class EnvironmentVariables {
    @IsIn(['development', 'production', 'test'])
    @IsOptional()
    NODE_ENV: NodeEnv = 'development';

    @IsNumber()
    @IsOptional()
    PORT: number = 3000;

    @IsString()
    @IsNotEmpty()
    DATABASE_URL!: string;

    @IsString()
    @IsNotEmpty()
    JWT_ACCESS_SECRET!: string;

    @IsString()
    @IsNotEmpty()
    JWT_REFRESH_SECRET!: string;

    @IsString()
    @IsOptional()
    JWT_ACCESS_TTL: string = '15m';

    @IsString()
    @IsOptional()
    JWT_REFRESH_TTL: string = '7d';

    @IsString()
    @IsNotEmpty()
    GEMINI_API_KEY!: string;

    @IsIn(['gemini', 'langchain'])
    @IsOptional()
    AI_PROVIDER: AiProvider = 'gemini';

    @IsString()
    @IsNotEmpty()
    CHAT_MODEL!: string;

    @IsString()
    @IsNotEmpty()
    EMBEDDING_MODEL!: string;

    @IsNumber()
    @IsOptional()
    EMBEDDING_DIMENSIONS: number = 768;

    @IsNumber()
    @IsOptional()
    CHUNK_SIZE: number = 900;

    @IsNumber()
    @IsOptional()
    CHUNK_OVERLAP: number = 120;

    @IsNumber()
    @IsOptional()
    RETRIEVAL_TOP_K: number = 5;

    @IsNumber()
    @IsOptional()
    RETRIEVAL_MIN_SCORE: number = 0.7;

    @IsNumber()
    @IsOptional()
    MAX_UPLOAD_MB: number = 10;

    @IsString()
    @IsOptional()
    CORS_ORIGIN: string = 'http://localhost:5173';

    // Cloudflare R2 storage credentials
    @IsString()
    @IsNotEmpty()
    R2_ENDPOINT!: string;

    @IsString()
    @IsNotEmpty()
    R2_BUCKET_NAME!: string;

    @IsString()
    @IsNotEmpty()
    R2_ACCESS_KEY_ID!: string;

    @IsString()
    @IsNotEmpty()
    R2_SECRET_ACCESS_KEY!: string;
}

// Boot-time validation function passed to ConfigModule
export function validate(config: Record<string, unknown>): EnvironmentVariables {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(`Environment validation failed: ${errors.toString()}`);
    }

    return validatedConfig;
}