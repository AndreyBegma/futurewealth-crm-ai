import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { ROUTES } from '@/shared/config';
import { registerThunk } from '../thunks';
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

  return { handleRegister};
};
