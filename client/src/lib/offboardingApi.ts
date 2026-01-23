import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class OffboardingApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/offboarding`,
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

  // Offboarding management
  async createOffboardingRequest(data: any) {
    return this.client.post('/', data);
  }

  async getOffboarding(offboardingId: string) {
    return this.client.get(`/${offboardingId}`);
  }

  async getTenantOffboardings(tenantId: string) {
    return this.client.get(`/tenant/${tenantId}`);
  }

  async getPropertyOffboardings(propertyId: string, status?: string) {
    return this.client.get(`/property/${propertyId}`, {
      params: { status },
    });
  }

  // Inspection scheduling
  async scheduleInspection(offboardingId: string, checklistId: string, inspectionDate: string) {
    return this.client.post(`/${offboardingId}/schedule-inspection`, {
      checklistId,
      inspectionDate,
    });
  }

  // Move-out inspection
  async recordMoveOutInspection(offboardingId: string, inspectionData: any) {
    return this.client.post(`/${offboardingId}/move-out-inspection`, inspectionData);
  }

  // Settlement
  async calculateFinalSettlement(offboardingId: string, damageAssessmentData: any) {
    return this.client.post(`/${offboardingId}/calculate-settlement`, damageAssessmentData);
  }

  // Refund
  // COMMENTED OUT - Payment process to be enabled later
  // async processRefund(offboardingId: string, paymentGateway: string, refundDetails: any) {
  //   return this.client.post(`/${offboardingId}/process-refund`, {
  //     paymentGateway,
  //     refundDetails,
  //   });
  // }

  // Clearance certificate
  async issueClearanceCertificate(offboardingId: string, certificateUrl: string) {
    return this.client.post(`/${offboardingId}/issue-certificate`, {
      certificateUrl,
    });
  }

  // Complete
  async completeOffboarding(offboardingId: string) {
    return this.client.post(`/${offboardingId}/complete`);
  }

  // Cancel
  async cancelOffboarding(offboardingId: string) {
    return this.client.post(`/${offboardingId}/cancel`);
  }
}

export default new OffboardingApiClient();
