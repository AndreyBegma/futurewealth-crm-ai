export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface UserState {
  currentUser: User | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
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
