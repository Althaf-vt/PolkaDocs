export default () => ({
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessTtl: process.env.JWT_ACCESS_TTL || '15m',
        refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
    },
    ai: {
        geminiApiKey: process.env.GEMINI_API_KEY,
        provider: process.env.AI_PROVIDER || 'gemini',
        chatModel: process.env.CHAT_MODEL,
        embeddingModel: process.env.EMBEDDING_MODEL,
        embeddingDimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '768', 10),
    },
    rag: {
        chunkSize: parseInt(process.env.CHUNK_SIZE || '900', 10),
        chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '120', 10),
        retrievalTopK: parseInt(process.env.RETRIEVAL_TOP_K || '5', 10),
        retrievalMinScore: parseFloat(process.env.RETRIEVAL_MIN_SCORE || '0.7'),
    },
    storage: {
        maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || '10', 10),
        r2: {
            endpoint: process.env.R2_ENDPOINT,
            bucketName: process.env.R2_BUCKET_NAME,
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
});