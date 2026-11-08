export interface AuthUserPayload {
    id: string;
    email: string;
    name: string | null;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    user: AuthUserPayload;
}