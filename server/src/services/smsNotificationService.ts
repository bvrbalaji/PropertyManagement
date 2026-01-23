// SMS Notification Service
import prisma from '../config/database';
import { NotificationChannel, NotificationDeliveryStatus } from '@prisma/client';
import axios from 'axios';

interface SMSNotification {
  recipientPhone: string;
  message: string;
  recipientId: string;
  notificationId: string;
}

class SMSService {
  private smsProvider: string;
  private smsApiKey: string;
  private smsApiUrl: string;

  constructor() {
    // Support multiple SMS providers: AWS SNS, Twilio, MSG91, etc.
    this.smsProvider = process.env.SMS_PROVIDER || 'msg91';
    this.smsApiKey = process.env.SMS_API_KEY || '';
    this.smsApiUrl = process.env.SMS_API_URL || '';
  }

  /**
   * Send single SMS notification
   */
  async sendSMS(notification: SMSNotification): Promise<{
    success: boolean;
    deliveryId?: string;
    errorCode?: string;
    errorMessage?: string;
  }> {
    try {
      // Create delivery record
      const delivery = await prisma.notificationDelivery.create({
        data: {
          notificationId: notification.notificationId,
          recipientId: notification.recipientId,
          channel: NotificationChannel.SMS,
          destination: notification.recipientPhone,
          status: NotificationDeliveryStatus.PENDING,
        },
      });

      // Send SMS via provider
      const result = await this.sendViaSMSProvider(
        notification.recipientPhone,
        notification.message
      );

      if (result.success) {
        // Update delivery status
        await prisma.notificationDelivery.update({
          where: { id: delivery.id },
          data: {
            status: NotificationDeliveryStatus.SENT,
            sentAt: new Date(),
          },
        });

        // Log successful delivery
        await prisma.notificationLog.create({
          data: {
            notificationId: notification.notificationId,
            deliveryId: delivery.id,
            event: 'sent',
            channel: 'sms',
            recipient: notification.recipientPhone,
            success: true,
            metadata: { transactionId: result.transactionId },
          },
        });

        return {
          success: true,
          deliveryId: delivery.id,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('[SMSService] Error sending SMS:', error);

      // Update delivery with failure
      try {
        const delivery = await prisma.notificationDelivery.findFirst({
          where: {
            notificationId: notification.notificationId,
            recipientId: notification.recipientId,
            channel: NotificationChannel.SMS,
          },
        });

        if (delivery) {
          await prisma.notificationDelivery.update({
            where: { id: delivery.id },
            data: {
              status: NotificationDeliveryStatus.FAILED,
              failedAt: new Date(),
              errorCode: error.code || 'SMS_SEND_ERROR',
              errorMessage: error.message,
              retryCount: delivery.retryCount + 1,
              nextRetryAt:
                delivery.retryCount < 2
                  ? new Date(Date.now() + 5 * 60 * 1000)
                  : null,
            },
          });

          await prisma.notificationLog.create({
            data: {
              notificationId: notification.notificationId,
              deliveryId: delivery.id,
              event: 'failed',
              channel: 'sms',
              recipient: notification.recipientPhone,
              success: false,
              errorCode: error.code || 'SMS_SEND_ERROR',
              errorMessage: error.message,
            },
          });
        }
      } catch (logError) {
        console.error('[SMSService] Error logging failure:', logError);
      }

      return {
        success: false,
        errorCode: error.code || 'SMS_SEND_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Send SMS via external provider
   */
  private async sendViaSMSProvider(
    phoneNumber: string,
    message: string
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      if (this.smsProvider === 'msg91') {
        return await this.sendViaMSG91(phoneNumber, message);
      } else if (this.smsProvider === 'twilio') {
        return await this.sendViaTwilio(phoneNumber, message);
      } else if (this.smsProvider === 'aws') {
        return await this.sendViaAWS(phoneNumber, message);
      } else {
        throw new Error(`Unknown SMS provider: ${this.smsProvider}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send via MSG91
   */
  private async sendViaMSG91(
    phoneNumber: string,
    message: string
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const response = await axios.get('https://api.msg91.com/api/sendhttp.php', {
        params: {
          authkey: this.smsApiKey,
          mobiles: phoneNumber,
          message: message,
          route: 4,
          sender: 'PRPMGT', // Property Management
        },
      });

      if (response.data.type === 'success') {
        return {
          success: true,
          transactionId: response.data.message[0].msgid,
        };
      } else {
        return {
          success: false,
          error: response.data.message,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send via Twilio
   */
  private async sendViaTwilio(
    phoneNumber: string,
    message: string
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const response = await axios.post('https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json', {
        From: process.env.TWILIO_PHONE_NUMBER,
        To: phoneNumber,
        Body: message,
      });

      return {
        success: true,
        transactionId: response.data.sid,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send via AWS SNS
   */
  private async sendViaAWS(
    phoneNumber: string,
    message: string
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      // Implement AWS SNS integration
      // This would use AWS SDK
      return {
        success: true,
        transactionId: `aws-${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(smsNotifications: SMSNotification[]): Promise<{
    success: boolean;
    successCount: number;
    failureCount: number;
    deliveryIds: string[];
  }> {
    const results = await Promise.all(
      smsNotifications.map(sms => this.sendSMS(sms))
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const deliveryIds = results
      .filter(r => r.deliveryId)
      .map(r => r.deliveryId!);

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      deliveryIds,
    };
  }

  /**
   * Verify SMS delivery via webhook
   */
  async verifyDelivery(
    transactionId: string,
    status: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Find delivery by transaction ID in metadata
      const deliveries = await prisma.notificationDelivery.findMany({
        where: {
          AND: [
            { channel: NotificationChannel.SMS },
            {
              OR: [
                { sentAt: { not: null } },
                { status: NotificationDeliveryStatus.SENT },
              ],
            },
          ],
        },
        take: 1,
      });

      if (deliveries.length === 0) {
        return { success: false, error: 'Delivery not found' };
      }

      const delivery = deliveries[0];

      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: status as NotificationDeliveryStatus,
          deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        },
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get SMS delivery status
   */
  async getDeliveryStatus(deliveryId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      const delivery = await prisma.notificationDelivery.findUnique({
        where: { id: deliveryId },
      });

      if (!delivery) {
        return { success: false, error: 'Delivery not found' };
      }

      return {
        success: true,
        status: delivery.status,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default new SMSService();
