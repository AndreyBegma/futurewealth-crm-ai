import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { NavigateFunction } from 'react-router-dom';
import apiRoutes, { API_BASE_URL } from './api.route';
import { tokenStorage } from '@/shared/lib/storage/tokenStorage';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface FailedRequest {
  resolve: (token?: string) => void;
  reject: (error?: any) => void;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

export const setupInterceptors = (navigate: NavigateFunction) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      const excludedUrls = [apiRoutes.auth.refresh, apiRoutes.auth.signIn, apiRoutes.auth.signUp];
      const shouldRefresh =
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !excludedUrls.some((url) => originalRequest.url?.includes(url));

      if (shouldRefresh) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers)
                originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          tokenStorage.clearTokens();
          navigate('/auth/login', { replace: true });
          return Promise.reject(error);
        }

        try {
          const response = await axios.post<TokenResponse>(apiRoutes.auth.refresh, {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          tokenStorage.setTokens(accessToken, newRefreshToken);
          if (originalRequest.headers)
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          isRefreshing = false;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as AxiosError, null);
          isRefreshing = false;

          tokenStorage.clearTokens();
          navigate('/auth/login', { replace: true });

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
};

export default axiosInstance;
