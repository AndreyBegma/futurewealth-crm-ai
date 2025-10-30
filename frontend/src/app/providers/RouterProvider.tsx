import type { FC } from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import DashboardPage from '@/pages/DashboardPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

import { PublicRoute } from '@/features/auth/public-route';
import { RequireAuth } from '@/features/auth/require-auth';

import { ROUTES } from '@/shared/config/routes';

export const RouterProvider: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />

        <Route element={<PublicRoute />}>
          <Route path={ROUTES.auth.login} element={<LoginPage />} />
          <Route path={ROUTES.auth.register} element={<RegisterPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        </Route>

        <Route path={ROUTES.notFound} element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};
