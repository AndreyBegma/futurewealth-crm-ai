import type { RootState } from '@/shared/types';

export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectUserError = (state: RootState) => state.user.error;
export const selectUserLoading = (state: RootState) => state.user.loading;
