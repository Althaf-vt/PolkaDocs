import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import type { AuthResponse } from '../types/auth.types';

// Extended request configuration to track retry attempts
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// Centralized API base URL matching environment configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Centralized Axios client instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Queue management for handling concurrent requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

// Resolves or rejects queued requests once refresh completes
const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Singleton in-flight refresh promise to deduplicate concurrent refresh requests across the application
let inFlightRefreshPromise: Promise<AuthResponse> | null = null;

export const requestTokenRefresh = async (): Promise<AuthResponse> => {
    if (!inFlightRefreshPromise) {
        inFlightRefreshPromise = axios
            .post<AuthResponse>(
                `${API_BASE_URL}/auth/refresh`,
                {},
                { withCredentials: true },
            )
            .then((res) => {
                const { accessToken, user } = res.data;
                useAuthStore.getState().setAuth(user, accessToken);
                return res.data;
            })
            .finally(() => {
                inFlightRefreshPromise = null;
            });
    }
    return inFlightRefreshPromise;
};

// Request interceptor injecting the in-memory access token
apiClient.interceptors.request.use(
    (config) => {
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor intercepting 401s and refreshing tokens silently
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (!originalRequest || !error.response) {
            return Promise.reject(error);
        }

        // Do not attempt token refresh on auth entry endpoints
        const isAuthEndpoint =
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh');

        if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { accessToken } = await requestTokenRefresh();

                processQueue(null, accessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                return apiClient(originalRequest);
            } catch (refreshError: any) {
                processQueue(refreshError, null);
                if (refreshError?.response?.status === 401) {
                    useAuthStore.getState().clearAuth();
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);