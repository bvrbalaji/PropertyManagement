export enum UserRole {
  ADMIN = 'ADMIN',
  FLAT_OWNER = 'FLAT_OWNER',
  TENANT = 'TENANT',
  MAINTENANCE_STAFF = 'MAINTENANCE_STAFF',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  phone?: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
  mfaCode?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requiresMFA?: boolean;
}

export interface DashboardData {
  user: User;
  stats?: {
    totalUsers?: number;
    totalProperties?: number;
    activeSessions?: number;
    pendingRequests?: number;
  };
  properties?: any[];
  maintenanceRequests?: any[];
}
