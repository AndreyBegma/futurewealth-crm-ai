import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@/app/store/hooks';

import { loginThunk } from '@/entities/user/model/thunks';

import { ROUTES } from '@/shared/config';

import type { LoginFormData } from '../validation';

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (data: LoginFormData) => {
    const result = await dispatch(loginThunk(data));

    if (loginThunk.fulfilled.match(result)) {
      navigate(ROUTES.dashboard);
    } else {
      console.error('Login failed:', result.payload);
    }
  };

  return { handleLogin };
};
