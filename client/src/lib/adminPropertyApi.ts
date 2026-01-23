import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface Property {
  id: string;
  name: string;
  address: string;
  ownerId?: string | null;
  owner?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    apartments: number;
    tenantAssignments: number;
    maintenanceRequests: number;
  };
}

export interface PropertyStats {
  totalProperties: number;
  totalApartments: number;
  activeLeases: number;
  totalMaintenanceRequests: number;
}

export const adminPropertyApi = {
  // Get all properties with pagination and filters
  getAll: async (page = 1, limit = 10, search?: string, ownerId?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (ownerId) params.append('ownerId', ownerId);

    const response = await api.get<{ success: boolean; data: { properties: Property[]; pagination: any } }>(
      `/admin/properties?${params.toString()}`
    );
    return response.data;
  },

  // Get property by ID
  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Property }>(
      `/admin/properties/${id}`
    );
    return response.data;
  },

  // Create new property
  create: async (data: { name: string; address: string; ownerId?: string }) => {
    const response = await api.post<{ success: boolean; message: string; data: Property }>(
      '/admin/properties',
      data
    );
    return response.data;
  },

  // Update property
  update: async (id: string, data: Partial<{ name: string; address: string; ownerId?: string | null }>) => {
    const response = await api.put<{ success: boolean; message: string; data: Property }>(
      `/admin/properties/${id}`,
      data
    );
    return response.data;
  },

  // Delete property
  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/properties/${id}`
    );
    return response.data;
  },

  // Get property statistics
  getStats: async () => {
    const response = await api.get<{ success: boolean; data: PropertyStats }>(
      '/admin/properties/stats'
    );
    return response.data;
  },
};

export default adminPropertyApi;
