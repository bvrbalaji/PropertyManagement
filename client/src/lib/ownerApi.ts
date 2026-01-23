import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class OwnerApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/owner`,
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

  // Profile Management
  async getProfile() {
    return this.client.get('/profile');
  }

  async createProfile(data: any) {
    return this.client.post('/profile', data);
  }

  async updateProfile(data: any) {
    return this.client.put('/profile', data);
  }

  // Properties Dashboard
  async getProperties() {
    return this.client.get('/properties');
  }

  async addProperty(propertyId: string, ownershipPercentage: number = 100) {
    return this.client.post('/properties', {
      propertyId,
      ownershipPercentage,
    });
  }

  // Financial Summary
  async getFinancialSummary() {
    return this.client.get('/financial-summary');
  }

  // Communication Preferences
  async updateCommunicationPreference(preference: string) {
    return this.client.put('/communication-preference', {
      preference,
    });
  }

  // Co-owner Management
  async addCoOwner(coOwnerUserId: string, ownershipPercentage: number, relationshipType: string) {
    return this.client.post('/co-owners', {
      coOwnerUserId,
      ownershipPercentage,
      relationshipType,
    });
  }

  // Communications
  async getCommunications(limit: number = 50) {
    return this.client.get('/communications', { params: { limit } });
  }

  async markCommunicationAsRead(communicationId: string) {
    return this.client.put(`/communications/${communicationId}/read`);
  }

  // Ownership Verification
  async uploadVerificationDocument(documentType: string, fileName: string, fileUrl: string) {
    return this.client.post('/verification/documents', {
      documentType,
      fileName,
      fileUrl,
    });
  }

  async getVerificationStatus() {
    return this.client.get('/verification/status');
  }

  // Property Transfer
  async initiateTransfer(
    propertyId: string,
    transferredToUserId: string | null,
    transferDate: string,
    reason: string = '',
    legalDocumentUrl: string = '',
  ) {
    return this.client.post('/transfer/initiate', {
      propertyId,
      transferredToUserId,
      transferDate,
      reason,
      legalDocumentUrl,
    });
  }

  async getPendingTransfers() {
    return this.client.get('/transfer/pending');
  }

  async submitTransferForApproval(transferId: string) {
    return this.client.put(`/transfer/${transferId}/submit`);
  }

  async getTransferTimeline(initiationDate: string) {
    return this.client.post('/transfer/timeline', {
      initiationDate,
    });
  }

  async cancelTransfer(transferId: string, reason: string = '') {
    return this.client.delete(`/transfer/${transferId}`, {
      data: { reason },
    });
  }

  async getTransferHistory(propertyId: string) {
    return this.client.get(`/transfer/history/${propertyId}`);
  }

  // Admin Methods
  async getPendingVerifications(limit: number = 50) {
    return this.client.get('/admin/verification/pending', { params: { limit } });
  }

  async approveDocument(documentId: string, notes: string = '') {
    return this.client.put(`/admin/verification/${documentId}/approve`, { notes });
  }

  async rejectDocument(documentId: string, rejectionReason: string) {
    return this.client.put(`/admin/verification/${documentId}/reject`, { rejectionReason });
  }

  async getVerificationStatusAdmin(ownerProfileId: string) {
    return this.client.get(`/admin/verification/${ownerProfileId}/status`);
  }

  async getPendingTransfersAdmin(propertyId: string) {
    return this.client.get('/admin/transfer/pending', { params: { propertyId } });
  }

  async getTransferDetailsAdmin(transferId: string) {
    return this.client.get(`/admin/transfer/${transferId}`);
  }

  async approveTransfer(transferId: string) {
    return this.client.put(`/admin/transfer/${transferId}/approve`);
  }

  async rejectTransfer(transferId: string, rejectionReason: string) {
    return this.client.put(`/admin/transfer/${transferId}/reject`, { rejectionReason });
  }

  async completeTransfer(transferId: string) {
    return this.client.put(`/admin/transfer/${transferId}/complete`);
  }
}

export default new OwnerApiClient();
