// Push Notification Service
import prisma from '../config/database';
import { NotificationChannel, NotificationDeliveryStatus } from '@prisma/client';
import * as admin from 'firebase-admin';

interface PushNotification {
  recipientId: string;
  notificationId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  deviceId?: string; // Specific device, optional
}

class PushNotificationService {
  private firebaseApp: admin.app.App;

  constructor() {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    this.firebaseApp = admin.app();
  }

  /**
   * Send push notification to user devices
   */
  async sendPush(notification: PushNotification): Promise<{
    success: boolean;
    deliveryIds?: string[];
    failedDevices?: string[];
    errorMessage?: string;
  }> {
    try {
      // Get user's device tokens
      const devices = await prisma.pushDeviceToken.findMany({
        where: {
          userId: notification.recipientId,
          isActive: true,
          ...(notification.deviceId && { deviceId: notification.deviceId }),
        },
      });

      if (devices.length === 0) {
        return {
          success: false,
          errorMessage: 'No active devices found for user',
        };
      }

      const messaging = admin.messaging(this.firebaseApp);
      const deliveryIds: string[] = [];
      const failedDevices: string[] = [];

      for (const device of devices) {
        try {
          // Create delivery record
          const delivery = await prisma.notificationDelivery.create({
            data: {
              notificationId: notification.notificationId,
              recipientId: notification.recipientId,
              channel: NotificationChannel.PUSH,
              destination: device.token,
              status: NotificationDeliveryStatus.PENDING,
              deviceId: device.deviceId,
              deviceType: device.deviceType,
            },
          });

          // Send push notification
          const response = await messaging.send({
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: notification.data || {},
            token: device.token,
            android: {
              priority: 'high',
            },
            apns: {
              headers: {
                'apns-priority': '10',
              },
            },
            webpush: {
              headers: {
                'TTL': '3600',
              },
            },
          });

          // Update delivery status
          await prisma.notificationDelivery.update({
            where: { id: delivery.id },
            data: {
              status: NotificationDeliveryStatus.SENT,
              sentAt: new Date(),
            },
          });

          // Update device last used
          await prisma.pushDeviceToken.update({
            where: { id: device.id },
            data: { lastUsedAt: new Date() },
          });

          // Log success
          await prisma.notificationLog.create({
            data: {
              notificationId: notification.notificationId,
              deliveryId: delivery.id,
              event: 'sent',
              channel: 'push',
              recipient: device.deviceType,
              success: true,
              metadata: { messageId: response },
            },
          });

          deliveryIds.push(delivery.id);
        } catch (deviceError: any) {
          console.error('[PushService] Error sending to device:', deviceError);

          // Check if token is invalid
          if (
            deviceError.code === 'messaging/invalid-registration-token' ||
            deviceError.code === 'messaging/registration-token-not-registered'
          ) {
            // Deactivate invalid token
            await prisma.pushDeviceToken.update({
              where: { id: device.id },
              data: { isActive: false },
            });
          }

          failedDevices.push(device.deviceId);
        }
      }

      return {
        success: failedDevices.length === 0,
        deliveryIds,
        failedDevices: failedDevices.length > 0 ? failedDevices : undefined,
      };
    } catch (error: any) {
      console.error('[PushService] Error in sendPush:', error);
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Send bulk push notifications
   */
  async sendBulkPush(notifications: PushNotification[]): Promise<{
    success: boolean;
    totalSent: number;
    totalFailed: number;
  }> {
    const results = await Promise.all(
      notifications.map(notif => this.sendPush(notif))
    );

    const totalSent = results.filter(r => r.success).length;
    const totalFailed = results.filter(r => !r.success).length;

    return {
      success: totalFailed === 0,
      totalSent,
      totalFailed,
    };
  }

  /**
   * Register device token
   */
  async registerDevice(userId: string, token: string, deviceInfo: {
    deviceId: string;
    deviceType: 'ios' | 'android' | 'web';
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
  }): Promise<{
    success: boolean;
    deviceTokenId?: string;
    error?: string;
  }> {
    try {
      // Check if token already exists
      const existing = await prisma.pushDeviceToken.findFirst({
        where: {
          userId,
          deviceId: deviceInfo.deviceId,
        },
      });

      if (existing) {
        // Update existing token
        await prisma.pushDeviceToken.update({
          where: { id: existing.id },
          data: {
            token,
            isActive: true,
            isVerified: false,
          },
        });

        return {
          success: true,
          deviceTokenId: existing.id,
        };
      }

      // Create new device token
      const deviceToken = await prisma.pushDeviceToken.create({
        data: {
          userId,
          token,
          deviceId: deviceInfo.deviceId,
          deviceType: deviceInfo.deviceType,
          deviceModel: deviceInfo.deviceModel,
          osVersion: deviceInfo.osVersion,
          appVersion: deviceInfo.appVersion,
          isActive: true,
        },
      });

      return {
        success: true,
        deviceTokenId: deviceToken.id,
      };
    } catch (error: any) {
      console.error('[PushService] Error registering device:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Unregister device
   */
  async unregisterDevice(userId: string, deviceId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await prisma.pushDeviceToken.updateMany({
        where: {
          userId,
          deviceId,
        },
        data: {
          isActive: false,
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
   * Get user devices
   */
  async getUserDevices(userId: string): Promise<{
    success: boolean;
    devices?: any[];
    error?: string;
  }> {
    try {
      const devices = await prisma.pushDeviceToken.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          deviceId: true,
          deviceType: true,
          deviceModel: true,
          osVersion: true,
          appVersion: true,
          lastUsedAt: true,
        },
      });

      return {
        success: true,
        devices,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Track push notification engagement
   */
  async trackEngagement(
    deliveryId: string,
    event: 'opened' | 'clicked'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const delivery = await prisma.notificationDelivery.findUnique({
        where: { id: deliveryId },
      });

      if (!delivery) {
        return { success: false, error: 'Delivery not found' };
      }

      const updateData: any = {};

      if (event === 'opened') {
        updateData.openedAt = new Date();
        updateData.openCount = (delivery.openCount || 0) + 1;
        updateData.status = NotificationDeliveryStatus.OPENED;
      } else if (event === 'clicked') {
        updateData.clickedAt = new Date();
        updateData.clickCount = (delivery.clickCount || 0) + 1;
        updateData.status = NotificationDeliveryStatus.CLICKED;
      }

      await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: updateData,
      });

      // Log engagement
      await prisma.notificationLog.create({
        data: {
          deliveryId,
          event,
          channel: 'push',
          success: true,
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
   * Send topic-based push (multicast)
   */
  async sendToTopic(topic: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const messaging = admin.messaging(this.firebaseApp);

      const messageId = await messaging.send({
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        topic,
      });

      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Subscribe user to topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const messaging = admin.messaging(this.firebaseApp);
      await messaging.subscribeToTopic(tokens, topic);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const messaging = admin.messaging(this.firebaseApp);
      await messaging.unsubscribeFromTopic(tokens, topic);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new PushNotificationService();
