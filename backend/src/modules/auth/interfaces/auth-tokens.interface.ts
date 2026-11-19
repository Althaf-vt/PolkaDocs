export interface AuthUserPayload {
    id: string;
    email: string;
    name: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    user: AuthUserPayload;
}