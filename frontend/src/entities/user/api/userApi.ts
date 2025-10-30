import { api } from '@/shared/api/api';
import apiRoutes from '@/shared/api/api.route';

export interface UserResponseData {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  data: UserResponseData;
}

export const userApi = {
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(apiRoutes.auth.me);
    return response;
  },
};
