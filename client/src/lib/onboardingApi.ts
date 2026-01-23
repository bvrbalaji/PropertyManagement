import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class OnboardingApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/onboarding`,
      withCredentials: true,
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = Cookies.get('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Onboarding management
  async createOnboarding(data: any) {
    return this.client.post('/', data);
  }

  async getOnboarding(onboardingId: string) {
    return this.client.get(`/${onboardingId}`);
  }

  async getTenantOnboardings(tenantId: string) {
    return this.client.get(`/tenant/${tenantId}`);
  }

  async getPropertyOnboardings(propertyId: string, status?: string) {
    return this.client.get(`/property/${propertyId}`, {
      params: { status },
    });
  }

  // Document uploads
  async uploadLeaseAgreement(onboardingId: string, fileUrl: string, fileName: string) {
    return this.client.post(`/${onboardingId}/lease-agreement`, {
      fileUrl,
      fileName,
    });
  }

  async uploadVehicleRegistration(onboardingId: string, fileUrl: string, fileName: string) {
    return this.client.post(`/${onboardingId}/vehicle-registration`, {
      fileUrl,
      fileName,
    });
  }

  // Lease signing
  async signLeaseAgreement(onboardingId: string, signature: string) {
    return this.client.post(`/${onboardingId}/sign-lease`, {
      signature,
    });
  }

  // Payment
  async initiateSecurityDepositPayment(
    onboardingId: string,
    amount: number,
    customerEmail: string,
    customerPhone: string,
    paymentGateway?: string,
  ) {
    return this.client.post(`/${onboardingId}/initiate-payment`, {
      amount,
      customerEmail,
      customerPhone,
      paymentGateway: paymentGateway || 'RAZORPAY',
    });
  }

  async verifySecurityDepositPayment(
    onboardingId: string,
    orderId: string,
    paymentId: string,
    signature: string,
    amount: number,
  ) {
    return this.client.post(`/${onboardingId}/verify-payment`, {
      orderId,
      paymentId,
      signature,
      amount,
    });
  }

  // Parking
  async assignParkingSlot(onboardingId: string, vehicleType: string) {
    return this.client.post(`/${onboardingId}/assign-parking`, {
      vehicleType,
    });
  }

  // Inspection
  async createInspectionChecklist(propertyId: string, name: string, items: any[], isForOnboarding?: boolean) {
    return this.client.post(`/property/${propertyId}/inspection-checklist`, {
      name,
      items,
      isForOnboarding,
    });
  }

  async getInspectionChecklists(propertyId: string, isForOnboarding?: boolean) {
    return this.client.get(`/property/${propertyId}/inspection-checklists`, {
      params: { isForOnboarding },
    });
  }

  async createMoveInInspection(onboardingId: string, checklistId: string, inspectionData: any) {
    return this.client.post(`/${onboardingId}/move-in-inspection`, {
      checklistId,
      inspectionData,
    });
  }

  // Complete
  async completeOnboarding(onboardingId: string) {
    return this.client.post(`/${onboardingId}/complete`);
  }
}

export default new OnboardingApiClient();
