import { apiClient } from './client';
import type {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    User,
} from '../types/auth.types';

export const authApi = {
    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
        return response.data;
    },

    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    refresh: async (): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/refresh');
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    getMe: async (): Promise<User> => {
        const response = await apiClient.get<User>('/users/me');
        return response.data;
    },
};