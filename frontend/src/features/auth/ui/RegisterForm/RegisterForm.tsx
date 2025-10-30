import type { FC } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { FiLock, FiMail, FiUser } from 'react-icons/fi';

import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';

import { type RegisterFormData, registerSchema } from '../../model/validation';
import FormLayout from '../FormLayout/FormLayout';
import { useAppSelector } from '@/app/store/hooks';

const RegisterForm: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });
  const onSubmit = (data: RegisterFormData) => {
    console.log(data);
  };

  const { error } = useAppSelector((state) => state.user);

  return (
    <div>
      <FormLayout title="Sign-up" type="sign-up" onSubmit={handleSubmit(onSubmit)} error={error}>
        <TextField
          label="Name"
          {...register('name')}
          startIcon={FiUser}
          error={errors.name?.message}
        />
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
        <TextField
          label="Confirm Password"
          inputType="password"
          showPasswordToggle
          startIcon={FiLock}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit">Sign up</Button>
      </FormLayout>
    </div>
  );
};

export default RegisterForm;
