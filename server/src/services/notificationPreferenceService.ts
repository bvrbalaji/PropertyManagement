// Notification Preference Service
import prisma from '../config/database';
import { NotificationPreference } from '@prisma/client';

interface PreferenceUpdateInput {
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
  quietHourStart?: number;
  quietHourEnd?: number;
  doNotDisturbEnabled?: boolean;
  weeklyDigest?: boolean;
  dailyDigest?: boolean;
  instantNotifications?: boolean;
  smsFrequency?: string;
}

class NotificationPreferenceService {
  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<{
    success: boolean;
    preferences?: NotificationPreference | null;
    error?: string;
  }> {
    try {
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences) {
        // Create default preferences if not exist
        const defaultPrefs = await this.createDefaultPreferences(userId);
        return {
          success: true,
          preferences: defaultPrefs,
        };
      }

      return {
        success: true,
        preferences,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update preferences
   */
  async updatePreferences(
    userId: string,
    updates: PreferenceUpdateInput
  ): Promise<{
    success: boolean;
    preferences?: NotificationPreference;
    error?: string;
  }> {
    try {
      // Ensure preferences exist
      let preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences) {
        preferences = await this.createDefaultPreferences(userId);
      }

      // Update preferences
      const updated = await prisma.notificationPreference.update({
        where: { userId },
        data: updates,
      });

      return {
        success: true,
        preferences: updated,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if notification should be sent
   */
  async shouldSendNotification(
    userId: string,
    notificationType: string,
    channel: string
  ): Promise<{
    success: boolean;
    shouldSend: boolean;
    reason?: string;
  }> {
    try {
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences) {
        // Default: send all notifications
        return { success: true, shouldSend: true };
      }

      // Check channel enabled
      if (
        channel === 'email' &&
        !preferences.emailEnabled
      ) {
        return {
          success: true,
          shouldSend: false,
          reason: 'Email channel disabled',
        };
      }

      if (
        channel === 'sms' &&
        !preferences.smsEnabled
      ) {
        return {
          success: true,
          shouldSend: false,
          reason: 'SMS channel disabled',
        };
      }

      if (
        channel === 'push' &&
        !preferences.pushEnabled
      ) {
        return {
          success: true,
          shouldSend: false,
          reason: 'Push notifications disabled',
        };
      }

      if (
        channel === 'in_app' &&
        !preferences.inAppEnabled
      ) {
        return {
          success: true,
          shouldSend: false,
          reason: 'In-app notifications disabled',
        };
      }

      // Check notification type
      if (
        notificationType === 'INVOICE_CREATED' &&
        !preferences.invoiceNotifications
      ) {
        return {
          success: true,
          shouldSend: false,
          reason: 'Invoice notifications disabled',
        };
      }

      if (
        notificationType === 'PAYMENT_REMINDER' &&
        !preferences.paymentNotifications
      ) {
        return {
          success: true,
          shouldSend: false,
          reason: 'Payment notifications disabled',
        };
      }

      if (
        notificationType === 'MAINTENANCE_ALERT' &&
        !preferences.maintenanceNotifications
      ) {
        return {
          success: true,
          shouldSend: false,
          reason: 'Maintenance notifications disabled',
        };
      }

      if (
        notificationType === 'BROADCAST' &&
        !preferences.broadcastNotifications
      ) {
        return {
          success: true,
          shouldSend: false,
          reason: 'Broadcast notifications disabled',
        };
      }

      if (
        notificationType === 'SYSTEM_NOTIFICATION' &&
        !preferences.systemNotifications
      ) {
        return {
          success: true,
          shouldSend: false,
          reason: 'System notifications disabled',
        };
      }

      // Emergency notifications cannot be disabled
      if (notificationType === 'EMERGENCY') {
        return {
          success: true,
          shouldSend: true,
          reason: 'Emergency notification (cannot be disabled)',
        };
      }

      // Check quiet hours
      if (preferences.doNotDisturbEnabled && preferences.quietHourStart && preferences.quietHourEnd) {
        const now = new Date();
        const currentHour = now.getHours();

        if (preferences.quietHourStart <= preferences.quietHourEnd) {
          // e.g., 22 to 8 (10 PM to 8 AM)
          if (currentHour >= preferences.quietHourStart || currentHour < preferences.quietHourEnd) {
            return {
              success: true,
              shouldSend: false,
              reason: 'During quiet hours',
            };
          }
        } else {
          // Wraps around midnight
          if (currentHour >= preferences.quietHourStart && currentHour < preferences.quietHourEnd) {
            return {
              success: true,
              shouldSend: false,
              reason: 'During quiet hours',
            };
          }
        }
      }

      return { success: true, shouldSend: true };
    } catch (error: any) {
      return {
        success: false,
        shouldSend: true, // Default to sending on error
        reason: error.message,
      };
    }
  }

  /**
   * Set quiet hours
   */
  async setQuietHours(
    userId: string,
    startHour: number,
    endHour: number
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
        return {
          success: false,
          error: 'Hours must be between 0 and 23',
        };
      }

      await prisma.notificationPreference.update({
        where: { userId },
        data: {
          quietHourStart: startHour,
          quietHourEnd: endHour,
        },
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enable/disable do not disturb
   */
  async setDoNotDisturb(
    userId: string,
    enabled: boolean
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await prisma.notificationPreference.update({
        where: { userId },
        data: {
          doNotDisturbEnabled: enabled,
        },
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enable digest delivery
   */
  async enableDigest(
    userId: string,
    type: 'daily' | 'weekly'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const updates: any = {};

      if (type === 'daily') {
        updates.dailyDigest = true;
        updates.weeklyDigest = false;
      } else {
        updates.weeklyDigest = true;
        updates.dailyDigest = false;
      }

      updates.instantNotifications = false;

      await prisma.notificationPreference.update({
        where: { userId },
        data: updates,
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Disable digest delivery
   */
  async disableDigest(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await prisma.notificationPreference.update({
        where: { userId },
        data: {
          dailyDigest: false,
          weeklyDigest: false,
          instantNotifications: true,
        },
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set SMS frequency
   */
  async setSMSFrequency(
    userId: string,
    frequency: 'immediate' | 'daily' | 'weekly' | 'never'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await prisma.notificationPreference.update({
        where: { userId },
        data: {
          smsFrequency: frequency,
        },
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Unsubscribe from all notifications
   */
  async unsubscribeAll(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await prisma.notificationPreference.update({
        where: { userId },
        data: {
          emailEnabled: false,
          smsEnabled: false,
          pushEnabled: false,
          inAppEnabled: false,
          whatsappEnabled: false,
          invoiceNotifications: false,
          paymentNotifications: false,
          maintenanceNotifications: false,
          broadcastNotifications: false,
          systemNotifications: false,
          emergencyNotifications: true, // Always on
        },
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get default preferences
   */
  private async createDefaultPreferences(
    userId: string
  ): Promise<NotificationPreference> {
    return await prisma.notificationPreference.create({
      data: {
        userId,
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        whatsappEnabled: false,
        invoiceNotifications: true,
        paymentNotifications: true,
        maintenanceNotifications: true,
        broadcastNotifications: true,
        emergencyNotifications: true,
        systemNotifications: true,
        doNotDisturbEnabled: false,
        weeklyDigest: false,
        dailyDigest: false,
        instantNotifications: true,
        smsFrequency: 'immediate',
      },
    });
  }
}

export default new NotificationPreferenceService();
