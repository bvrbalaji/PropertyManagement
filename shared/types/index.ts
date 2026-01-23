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

export enum OnboardingStatus {
  INQUIRY = 'INQUIRY',
  FORM_SUBMITTED = 'FORM_SUBMITTED',
  INSPECTION_PENDING = 'INSPECTION_PENDING',
  LEASE_SIGNED = 'LEASE_SIGNED',
  DEPOSIT_PENDING = 'DEPOSIT_PENDING',
  PARKING_ASSIGNED = 'PARKING_ASSIGNED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OffboardingStatus {
  REQUESTED = 'REQUESTED',
  INSPECTION_SCHEDULED = 'INSPECTION_SCHEDULED',
  INSPECTION_COMPLETED = 'INSPECTION_COMPLETED',
  SETTLEMENT_PENDING = 'SETTLEMENT_PENDING',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum VehicleType {
  TWO_WHEELER = 'TWO_WHEELER',
  FOUR_WHEELER = 'FOUR_WHEELER',
  SUV = 'SUV',
  COMMERCIAL = 'COMMERCIAL',
}

export enum ParkingSlotStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
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

// Onboarding Types
export interface TenantOnboarding {
  id: string;
  tenantId: string;
  apartmentId: string;
  propertyId: string;
  status: OnboardingStatus;
  moveInDate: string;
  securityDeposit: number;
  depositPaid: number;
  leaseAgreement?: string;
  leaseSignedAt?: string;
  parkingSlotId?: string;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingDocument {
  id: string;
  onboardingId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface OnboardingPayment {
  id: string;
  onboardingId: string;
  amount: number;
  paymentGateway: string;
  paymentId: string;
  status: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Offboarding Types
export interface TenantOffboarding {
  id: string;
  tenantId: string;
  apartmentId: string;
  propertyId: string;
  onboardingId: string;
  status: OffboardingStatus;
  moveOutDate?: string;
  noticeDate: string;
  offboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinalSettlement {
  id: string;
  offboardingId: string;
  securityDeposit: number;
  damageCharges: number;
  pendingDues: number;
  refundAmount: number;
  refundDate?: string;
  refundStatus: string;
  createdAt: string;
  updatedAt: string;
}

// Parking Types
export interface ParkingSlot {
  id: string;
  propertyId: string;
  slotNumber: string;
  floor?: string;
  vehicleType: VehicleType;
  status: ParkingSlotStatus;
  assignedToId?: string;
  assignedAt?: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Inspection Types
export interface InspectionChecklist {
  id: string;
  propertyId: string;
  name: string;
  isForOnboarding: boolean;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  itemName: string;
  category: string;
  createdAt: string;
}

export interface Inspection {
  id: string;
  onboardingId?: string;
  offboardingId?: string;
  inspectionDate: string;
  inspectedBy: string;
  damageAssessment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionPhoto {
  id: string;
  inspectionId: string;
  photoUrl: string;
  beforePhoto?: string;
  afterPhoto?: string;
  uploadedAt: string;
}

// Request/Response Types
export interface OnboardingFormData {
  apartmentId: string;
  propertyId: string;
  moveInDate: string;
  securityDeposit: number;
  vehicleType: VehicleType;
}

export interface OffboardingRequestData {
  apartmentId: string;
  propertyId: string;
  onboardingId: string;
  moveOutDate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
