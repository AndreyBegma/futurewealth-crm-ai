import { useNavigate } from 'react-router-dom';

import { registerThunk } from '@/entities/user/model/thunks';

import { ROUTES } from '@/shared/config';
import { useAppDispatch } from '@/shared/lib/hooks';

import type { RegisterFormData } from '../validation';

export const useRegister = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleRegister = async (data: RegisterFormData) => {
    const result = await dispatch(registerThunk(data));

    if (registerThunk.fulfilled.match(result)) {
      navigate(ROUTES.dashboard);
    } else {
      console.error('Registration failed:', result.payload);
    }
  };

  return { handleRegister };
};
