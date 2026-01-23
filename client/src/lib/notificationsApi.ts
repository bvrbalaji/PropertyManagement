// Notification API Client - Frontend integration
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class NotificationsAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/notifications`,
      withCredentials: true,
    });
  }

  // ============ NOTIFICATIONS ============

  /**
   * Send notification to users
   */
  async sendNotification(data: {
    notificationType: string;
    subject: string;
    body: string;
    htmlBody?: string;
    channels: string[];
    recipientIds?: string[];
    targetFloors?: string[];
    targetApartments?: string[];
    priority?: string;
    scheduledFor?: string;
  }) {
    try {
      const response = await this.api.post('/send', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Send broadcast message
   */
  async sendBroadcast(data: {
    propertyId: string;
    title: string;
    message: string;
    htmlMessage?: string;
    targetAudience?: string;
    targetFloors?: string[];
    targetApartments?: string[];
    channels: string[];
  }) {
    try {
      const response = await this.api.post('/broadcast/send', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Get user notifications
   */
  async getNotifications(params?: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const response = await this.api.get('/', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      const response = await this.api.put(`/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Archive notification
   */
  async archiveNotification(notificationId: string) {
    try {
      const response = await this.api.put(`/${notificationId}/archive`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  // ============ PREFERENCES ============

  /**
   * Get notification preferences
   */
  async getPreferences() {
    try {
      const response = await this.api.get('/preferences/get');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(data: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    inAppEnabled?: boolean;
    whatsappEnabled?: boolean;
    invoiceNotifications?: boolean;
    paymentNotifications?: boolean;
    maintenanceNotifications?: boolean;
    broadcastNotifications?: boolean;
    emergencyNotifications?: boolean;
    systemNotifications?: boolean;
    instantNotifications?: boolean;
    [key: string]: any;
  }) {
    try {
      const response = await this.api.patch('/preferences/update', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Set quiet hours
   */
  async setQuietHours(startHour: number, endHour: number) {
    try {
      const response = await this.api.post('/preferences/quiet-hours', {
        startHour,
        endHour,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Enable digest delivery
   */
  async enableDigest(type: 'daily' | 'weekly') {
    try {
      const response = await this.api.post('/preferences/digest/enable', { type });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  // ============ DEVICES - DISABLED ============
  // TODO: Enable push notifications later

  /**
   * Register push device
   * DISABLED: Push notifications disabled - enable later
   */
  // async registerDevice(data: {
  //   token: string;
  //   deviceId: string;
  //   deviceType: 'ios' | 'android' | 'web';
  //   deviceModel?: string;
  //   osVersion?: string;
  //   appVersion?: string;
  // }) {
  //   try {
  //     const response = await this.api.post('/devices/register', data);
  //     return response.data;
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error: error.response?.data?.error || error.message,
  //     };
  //   }
  // }

  /**
   * Get user devices
   * DISABLED: Push notifications disabled - enable later
   */
  // async getUserDevices() {
  //   try {
  //     const response = await this.api.get('/devices');
  //     return response.data;
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error: error.response?.data?.error || error.message,
  //     };
  //   }
  // }

  /**
   * Unregister device
   * DISABLED: Push notifications disabled - enable later
   */
  // async unregisterDevice(deviceId: string) {
  //   try {
  //     const response = await this.api.delete(`/devices/${deviceId}`);
  //     return response.data;
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error: error.response?.data?.error || error.message,
  //     };
  //   }
  // }

  /**
   * Track push notification engagement
   * DISABLED: Push notifications disabled - enable later
   */
  // async trackEngagement(deliveryId: string, event: 'opened' | 'clicked') {
  //   try {
  //     const response = await this.api.post(`/devices/${deliveryId}/track/${event}`);
  //     return response.data;
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error: error.response?.data?.error || error.message,
  //     };
  //   }
  // }

  // ============ TEMPLATES ============

  /**
   * Create notification template
   */
  async createTemplate(data: {
    name: string;
    code: string;
    notificationType: string;
    channel: string;
    subject: string;
    body: string;
    variables?: Record<string, string>;
    propertyId?: string;
  }) {
    try {
      const response = await this.api.post('/templates/create', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Get templates
   */
  async getTemplates(params?: {
    propertyId?: string;
    notificationType?: string;
    channel?: string;
  }) {
    try {
      const response = await this.api.get('/templates', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  // ============ ANALYTICS ============

  /**
   * Get notification statistics
   */
  async getStatistics(propertyId?: string) {
    try {
      const response = await this.api.get('/statistics', {
        params: { propertyId },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }
}

export default new NotificationsAPI();

// Exported notification types for TypeScript support
export interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  whatsappEnabled: boolean;
  invoiceNotifications: boolean;
  paymentNotifications: boolean;
  maintenanceNotifications: boolean;
  broadcastNotifications: boolean;
  emergencyNotifications: boolean;
  systemNotifications: boolean;
  quietHourStart?: number;
  quietHourEnd?: number;
  doNotDisturbEnabled: boolean;
  weeklyDigest: boolean;
  dailyDigest: boolean;
  instantNotifications: boolean;
  smsFrequency: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  readAt?: Date;
  isArchived: boolean;
  archivedAt?: Date;
  createdAt: Date;
}

export interface PushDevice {
  id: string;
  deviceId: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  lastUsedAt?: Date;
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: string;
  openRate: string;
  clickRate: string;
  byChannel: Record<string, any>;
  byType: Record<string, number>;
}
