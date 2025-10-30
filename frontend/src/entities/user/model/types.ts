export type { AuthTokens, ApiResponse } from '@/shared/types';

export interface UserState {
  currentUser: User | null;
  tokens: {
    accessToken: string | null;
  };

  isAuthenticated: boolean;
  initialized: boolean;

  loading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}
