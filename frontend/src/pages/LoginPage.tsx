import type { FC } from 'react';

import AuthContainer from '@/widgets/AuthContainer/AuthContainer';

import LoginForm from '@/features/auth/ui/LoginForm/LoginForm';

const LoginPage: FC = () => {
  return (
    <AuthContainer>
      <LoginForm />
    </AuthContainer>
  );
};

export default LoginPage;
