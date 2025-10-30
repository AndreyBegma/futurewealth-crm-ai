import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AuthResponse, authApi } from '../../api/authApi';
import type { LoginFormData } from '../validation';

export const loginThunk = createAsyncThunk<AuthResponse, LoginFormData, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authApi.signIn(credentials);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  },
);
