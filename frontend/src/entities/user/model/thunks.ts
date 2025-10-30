import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AuthResponse, type UserResponse, authApi } from '@/shared/api';
import { getErrorMessage } from '@/shared/types';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const loginThunk = createAsyncThunk<AuthResponse, LoginFormData, { rejectValue: string }>(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authApi.signIn(credentials);
      return result;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Login failed');
      return rejectWithValue(errorMessage);
    }
  },
);

export const registerThunk = createAsyncThunk<
  AuthResponse,
  RegisterFormData,
  { rejectValue: string }
>('user/register', async (candidate, { rejectWithValue }) => {
  try {
    const result = await authApi.signUp(candidate);
    return result;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, 'Registration failed');
    return rejectWithValue(errorMessage);
  }
});

export const fetchCurrentUserThunk = createAsyncThunk<UserResponse, void, { rejectValue: string }>(
  'user/get-me',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authApi.getCurrentUser();
      return result;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Registration failed');
      return rejectWithValue(errorMessage);
    }
  },
);
