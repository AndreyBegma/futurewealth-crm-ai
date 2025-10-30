export const ROUTES = {
  home: '/',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  dashboard: '/dashboard',
  notFound: '*',
} as const;
