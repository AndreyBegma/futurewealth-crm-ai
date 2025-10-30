import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import type { RootState } from '@/shared/types';

// Properly typed dispatch that works with thunks
type AppThunkDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

// Re-export typed hooks for use across the application
// This avoids direct dependency on app layer from lower layers
export const useAppDispatch = () => useDispatch<AppThunkDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
