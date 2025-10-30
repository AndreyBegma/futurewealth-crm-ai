import { createSlice } from '@reduxjs/toolkit';

import { tokenStorage } from '@/shared/lib/storage';

import { fetchCurrentUserThunk, loginThunk, registerThunk } from './thunks';
import type { UserState } from './types';

const initialState: UserState = {
  currentUser: null,
  tokens: {
    accessToken: tokenStorage.getAccessToken(),
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

        const tokens = action.payload.data;
        state.tokens = tokens;
        tokenStorage.setAccessToken(tokens.accessToken);

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
        const tokens = action.payload.data;
        state.tokens = tokens;
        tokenStorage.setAccessToken(tokens.accessToken);
        state.isAuthenticated = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed';
      })

      .addCase(fetchCurrentUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.data;
        state.initialized = true;
      })
      .addCase(fetchCurrentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load user';
        state.initialized = true;

        state.isAuthenticated = false;
        state.tokens = {
          accessToken: null,
        };
        tokenStorage.clearTokens();
      });
  },
});

export const { logout } = userSlice.actions;
export const userReducer = userSlice.reducer;
