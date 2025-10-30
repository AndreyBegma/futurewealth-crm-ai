import type { FC } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { FiLock, FiMail } from 'react-icons/fi';

import { useAppSelector } from '@/app/store/hooks';

import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';

import { useLogin } from '../../model/hooks';
import { type LoginFormData, loginSchema } from '../../model/validation';
import FormLayout from '../FormLayout/FormLayout';

const LoginForm: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });
  const { handleLogin } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    handleLogin(data);
  };

  const { error } = useAppSelector((state) => state.user);
  return (
    <div>
      <FormLayout title="Sign-in" type="sign-in" onSubmit={handleSubmit(onSubmit)} error={error}>
        <TextField
          label="Email"
          {...register('email')}
          startIcon={FiMail}
          error={errors.email?.message}
        />
        <TextField
          label="Password"
          inputType="password"
          showPasswordToggle
          startIcon={FiLock}
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit">Sign in</Button>
      </FormLayout>
    </div>
  );
};

export default LoginForm;
