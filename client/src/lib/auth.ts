import api from './api';
import Cookies from 'js-cookie';
import { UserRole, RegisterRequest, LoginRequest, AuthResponse } from '../../../shared/types/index';

export const authService = {
  register: async (data: RegisterRequest) => {
    const response = await api.post<{ success: boolean; data: any; message: string }>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.data?.accessToken) {
      const cookieOptions = { path: '/', sameSite: 'lax' as const, expires: 1 };

      Cookies.set('accessToken', response.data.data.accessToken, cookieOptions);
      Cookies.set('refreshToken', response.data.data.refreshToken, { ...cookieOptions, expires: 7 });
      if (response.data.data.user?.role) {
        Cookies.set('userRole', response.data.data.user.role, cookieOptions);
      }
      if (response.data.data.user) {
        Cookies.set('userData', JSON.stringify(response.data.data.user), cookieOptions);
      }
    }
    // Return in the format the login page expects
    return {
      user: response.data.data?.user,
      requiresMFA: response.data.requiresMFA,
      accessToken: response.data.data?.accessToken,
      refreshToken: response.data.data?.refreshToken,
    };
  },

  verifyOTP: async (userId: string, code: string, type: 'EMAIL' | 'PHONE') => {
    const response = await api.post('/auth/verify-otp', { userId, code, type });
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('userRole');
    Cookies.remove('userData');
  },

  forgotPassword: async (emailOrPhone: string) => {
    const response = await api.post('/auth/forgot-password', { emailOrPhone });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

export const getUserRole = (): UserRole | null => {
  if (typeof window === 'undefined') return null;

  const role = Cookies.get('userRole');
  return role as UserRole | null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!Cookies.get('accessToken');
};
