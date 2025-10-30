export interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
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

export interface RootState {
  user: UserState;
}

export type AppDispatch = (action: unknown) => unknown;
