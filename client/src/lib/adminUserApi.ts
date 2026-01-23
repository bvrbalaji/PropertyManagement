import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: 'ADMIN' | 'FLAT_OWNER' | 'TENANT' | 'MAINTENANCE_STAFF';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  _count?: {
    properties: number;
    sessions: number;
  };
}

export interface UserStats {
  totalUsers: number;
  byRole: Array<{ role: string; _count: number }>;
  byStatus: Array<{ status: string; _count: number }>;
}

export const adminUserApi = {
  // Get all users with pagination and filters
  getAll: async (page = 1, limit = 10, search?: string, role?: string, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);

    const response = await api.get<{ success: boolean; data: { users: User[]; pagination: any } }>(
      `/admin/users?${params.toString()}`
    );
    return response.data;
  },

  // Get user by ID
  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: User }>(
      `/admin/users/${id}`
    );
    return response.data;
  },

  // Create new user
  create: async (data: {
    email: string;
    phone?: string;
    password: string;
    fullName: string;
    role: string;
  }) => {
    const response = await api.post<{ success: boolean; message: string; data: User }>(
      '/admin/users',
      data
    );
    return response.data;
  },

  // Update user
  update: async (
    id: string,
    data: Partial<{
      email: string;
      phone: string;
      fullName: string;
      role: string;
      status: string;
    }>
  ) => {
    const response = await api.put<{ success: boolean; message: string; data: User }>(
      `/admin/users/${id}`,
      data
    );
    return response.data;
  },

  // Delete user (soft delete)
  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/users/${id}`
    );
    return response.data;
  },

  // Update user role
  updateRole: async (id: string, role: string) => {
    const response = await api.patch<{ success: boolean; message: string; data: User }>(
      `/admin/users/${id}/role`,
      { role }
    );
    return response.data;
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get<{ success: boolean; data: UserStats }>(
      '/admin/users/stats'
    );
    return response.data;
  },
};

export default adminUserApi;
