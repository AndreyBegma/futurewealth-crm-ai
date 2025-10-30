import type { FC } from 'react';

import RegisterForm from '@/features/auth/ui/RegisterForm/RegisterForm';

import { AuthLayout } from '@/shared/ui/layouts';

const RegisterPage: FC = () => {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
