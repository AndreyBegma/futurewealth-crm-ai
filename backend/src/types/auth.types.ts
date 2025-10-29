export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
}

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}
