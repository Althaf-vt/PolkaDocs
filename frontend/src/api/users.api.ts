import { apiClient } from './client';
import type { User } from '../types/auth.types';

export interface UpdateProfileDto {
    name?: string;
}

export const usersApi = {
    getProfile: async (): Promise<User> => {
        const response = await apiClient.get<User>('/users/me');
        return response.data;
    },

    updateProfile: async (dto: UpdateProfileDto): Promise<User> => {
        const response = await apiClient.patch<User>('/users/me', dto);
        return response.data;
    },
};

