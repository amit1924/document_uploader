import axiosInstance from './axios';
import type { AuthResponse, User } from '@/types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/refresh');
    return data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await axiosInstance.post('/auth/change-password', payload);
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    await axiosInstance.post('/auth/forgot-password', payload);
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    await axiosInstance.post('/auth/reset-password', payload);
  },

  getProfile: async (): Promise<User> => {
    const { data } = await axiosInstance.get<User>('/auth/profile');
    return data;
  },

  updateProfile: async (payload: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> => {
    const { data } = await axiosInstance.put<User>('/auth/profile', payload);
    return data;
  },
};
