import type { FC } from 'react';

import AuthContainer from '@/widgets/AuthContainer/AuthContainer';

import RegisterForm from '@/features/auth/ui/RegisterForm/RegisterForm';

const RegisterPage: FC = () => {
  return (
    <AuthContainer>
      <RegisterForm />
    </AuthContainer>
  );
};

export default RegisterPage;
