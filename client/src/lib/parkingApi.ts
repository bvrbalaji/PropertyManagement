import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ParkingApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/parking`,
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

  // Parking slot management
  async createParkingSlots(propertyId: string, slots: any[]) {
    return this.client.post(`/${propertyId}/slots`, { slots });
  }

  async getAvailableSlots(propertyId: string, vehicleType: string) {
    return this.client.get(`/${propertyId}/available`, {
      params: { vehicleType },
    });
  }

  async getPropertyParkingSlots(propertyId: string, status?: string) {
    return this.client.get(`/${propertyId}/all`, {
      params: { status },
    });
  }

  async getParkingSlotDetails(parkingSlotId: string) {
    return this.client.get(`/slot/${parkingSlotId}`);
  }

  // Update status
  async updateParkingSlotStatus(parkingSlotId: string, status: string) {
    return this.client.put(`/slot/${parkingSlotId}/status`, {
      status,
    });
  }

  // Statistics
  async getParkingStatistics(propertyId: string) {
    return this.client.get(`/${propertyId}/statistics`);
  }
}

export default new ParkingApiClient();
