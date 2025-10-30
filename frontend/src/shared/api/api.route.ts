export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';

const apiRoutes = {
  auth: {
    signIn: `${API_BASE_URL}/auth/sign-in`,
    signUp: `${API_BASE_URL}/auth/sign-up`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    me: `${API_BASE_URL}/auth/me`,
  },
} as const;

export default apiRoutes;
