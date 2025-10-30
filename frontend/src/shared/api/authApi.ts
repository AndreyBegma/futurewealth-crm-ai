import type { ApiResponse, AuthTokens } from '@/entities/user';

import { api } from './api';
import apiRoutes from './api.route';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name?: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserData {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  data: UserData;
}

export type AuthResponse = ApiResponse<{ tokens: AuthTokens }>;

export type RefreshTokenResponse = ApiResponse<AuthTokens>;

export const authApi = {
  signIn: async (data: LoginRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>(apiRoutes.auth.signIn, data);
  },

  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>(apiRoutes.auth.signUp, data);
  },

  refreshTokens: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    return api.post<RefreshTokenResponse>(apiRoutes.auth.refresh, data);
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    return api.get<UserResponse>(apiRoutes.auth.me);
  },
};
