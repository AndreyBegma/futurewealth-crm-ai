import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { NavigateFunction } from 'react-router-dom';

import { tokenStorage } from '@/shared/lib/storage/tokenStorage';

import apiRoutes, { API_BASE_URL } from './api.route';

interface TokenResponse {
  data: {
    accessToken: string;
  };
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

        try {
          const response = await axiosInstance.post<TokenResponse>(apiRoutes.auth.refresh);
          const { accessToken } = response.data.data;

          tokenStorage.setAccessToken(accessToken);
          if (originalRequest.headers)
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as AxiosError, null);

          tokenStorage.clearTokens();
          navigate('/auth/login', { replace: true });

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

export default axiosInstance;
