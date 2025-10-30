import type { FC } from 'react';

import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '@/app/store/hooks';

import { selectIsAuthenticated } from '@/entities/user/model/selectors';

import { ROUTES } from '@/shared/config';

const PublicLayout: FC = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);

  if (isAuth) return <Navigate to={ROUTES.dashboard} replace />;

  return <Outlet />;
};

export default PublicLayout;
