import type { FC } from 'react';

import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '@/app/store/hooks';

import { useInitSession } from '@/features/session';

import { selectIsAuthenticated } from '@/entities/user/model/selectors';

import { ROUTES } from '@/shared/config';

const RequireAuth: FC = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  useInitSession();

  if (!isAuth) return <Navigate to={ROUTES.auth.login} replace />;

  return <Outlet />;
};

export default RequireAuth;
