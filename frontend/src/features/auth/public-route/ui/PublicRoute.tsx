import type { FC } from 'react';

import { Navigate, Outlet } from 'react-router-dom';

import { selectIsAuthenticated } from '@/entities/user';

import { ROUTES } from '@/shared/config';
import { useAppSelector } from '@/shared/lib/hooks';

const PublicRoute: FC = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);

  if (isAuth) return <Navigate to={ROUTES.dashboard} replace />;

  return <Outlet />;
};

export default PublicRoute;
