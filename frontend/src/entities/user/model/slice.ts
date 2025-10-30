import { createSlice } from '@reduxjs/toolkit';

import { loginThunk, registerThunk } from '@/features/auth/model/thunks/index';

import { tokenStorage } from '@/shared/lib/storage';

import type { UserState } from './types';

const initialState: UserState = {
  currentUser: null,
  tokens: {
    accessToken: tokenStorage.getAccessToken(),
    refreshToken: tokenStorage.getRefreshToken(),
  },
  isAuthenticated: tokenStorage.isAuthenticated(),
  initialized: false,
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      tokenStorage.clearTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        console.log(action);
        state.loading = false;

        const tokens = action.payload.data.tokens;
        state.tokens = tokens;
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed';
      })

      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        const tokens = action.payload.data.tokens;
        state.tokens = tokens;
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        state.isAuthenticated = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed';
      });
  },
});

export const { logout } = userSlice.actions;
export const userReducer = userSlice.reducer;
