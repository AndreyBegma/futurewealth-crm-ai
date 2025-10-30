import type { FC } from 'react';

import { Navigate, Outlet } from 'react-router-dom';

import { useInitSession } from '@/features/session';

import { selectIsAuthenticated } from '@/entities/user/model/selectors';

import { ROUTES } from '@/shared/config';
import { useAppSelector } from '@/shared/lib/hooks';

const RequireAuth: FC = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  useInitSession();

  if (!isAuth) return <Navigate to={ROUTES.auth.login} replace />;

  return <Outlet />;
};

export default RequireAuth;
