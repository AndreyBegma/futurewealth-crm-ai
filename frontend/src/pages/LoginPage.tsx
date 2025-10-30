import type { FC } from 'react';

import LoginForm from '@/features/auth/ui/LoginForm/LoginForm';

import { AuthLayout } from '@/shared/ui/layouts';

const LoginPage: FC = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
