import type { FC } from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import DashboardPage from '@/pages/DashboardPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

import { ROUTES } from '@/shared/config/routes';
import { ProtectedLayout, PublicLayout } from '@/shared/ui/Routes';

export const RouterProvider: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />

        <Route element={<PublicLayout />}>
          <Route path={ROUTES.auth.login} element={<LoginPage />} />
          <Route path={ROUTES.auth.register} element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        </Route>

        <Route path={ROUTES.notFound} element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};
