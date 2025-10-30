import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AuthResponse, authApi } from '../../api/authApi';
import type { RegisterFormData } from '../validation';

export const registerThunk = createAsyncThunk<
  AuthResponse,
  RegisterFormData,
  { rejectValue: string }
>('auth/register', async (candidate, { rejectWithValue }) => {
  try {
    const result = await authApi.signUp(candidate);
    return result;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Login failed';
    return rejectWithValue(errorMessage);
  }
});
