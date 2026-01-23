// Email Notification Service
import prisma from '../config/database';
import { NotificationChannel, NotificationType, NotificationDeliveryStatus } from '@prisma/client';
import nodemailer from 'nodemailer';

interface EmailNotification {
  recipientEmail: string;
  subject: string;
  htmlBody: string;
  recipientId: string;
  notificationId: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Send single email notification
   */
  async sendEmail(notification: EmailNotification): Promise<{
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
          channel: NotificationChannel.EMAIL,
          destination: notification.recipientEmail,
          status: NotificationDeliveryStatus.PENDING,
        },
      });

      // Send email
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@propertymanagement.com',
        to: notification.recipientEmail,
        subject: notification.subject,
        html: notification.htmlBody,
      });

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
          channel: 'email',
          recipient: notification.recipientEmail,
          success: true,
          metadata: { messageId: info.messageId },
        },
      });

      return {
        success: true,
        deliveryId: delivery.id,
      };
    } catch (error: any) {
      console.error('[EmailService] Error sending email:', error);

      // Create failed delivery record if it exists
      try {
        const delivery = await prisma.notificationDelivery.findFirst({
          where: {
            notificationId: notification.notificationId,
            recipientId: notification.recipientId,
            channel: NotificationChannel.EMAIL,
          },
        });

        if (delivery) {
          await prisma.notificationDelivery.update({
            where: { id: delivery.id },
            data: {
              status: NotificationDeliveryStatus.FAILED,
              failedAt: new Date(),
              errorCode: error.code || 'EMAIL_SEND_ERROR',
              errorMessage: error.message,
              nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 mins
            },
          });

          await prisma.notificationLog.create({
            data: {
              notificationId: notification.notificationId,
              deliveryId: delivery.id,
              event: 'failed',
              channel: 'email',
              recipient: notification.recipientEmail,
              success: false,
              errorCode: error.code || 'EMAIL_SEND_ERROR',
              errorMessage: error.message,
            },
          });
        }
      } catch (logError) {
        console.error('[EmailService] Error logging failure:', logError);
      }

      return {
        success: false,
        errorCode: error.code || 'EMAIL_SEND_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Send bulk emails with retry logic
   */
  async sendBulkEmails(emails: EmailNotification[]): Promise<{
    success: boolean;
    successCount: number;
    failureCount: number;
    deliveryIds: string[];
  }> {
    const results = await Promise.all(
      emails.map(email => this.sendEmail(email))
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
   * Send email digest (daily/weekly)
   */
  async sendDigest(userId: string, notificationsPeriod: any[]): Promise<{
    success: boolean;
    errorMessage?: string;
  }> {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.email) {
        return { success: false, errorMessage: 'User email not found' };
      }

      // Build digest HTML
      const digestHtml = this.buildDigestHtml(notificationsPeriod);

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: `Notification Digest - ${new Date().toLocaleDateString()}`,
        html: digestHtml,
      });

      return { success: true };
    } catch (error: any) {
      console.error('[EmailService] Error sending digest:', error);
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  private buildDigestHtml(notifications: any[]): string {
    let html = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Your Notification Digest</h2>
          <table style="width: 100%; border-collapse: collapse;">
    `;

    notifications.forEach(notif => {
      html += `
        <tr style="border-bottom: 1px solid #ddd; padding: 10px;">
          <td>${notif.subject}</td>
          <td>${new Date(notif.createdAt).toLocaleString()}</td>
        </tr>
      `;
    });

    html += `
          </table>
        </body>
      </html>
    `;

    return html;
  }

  /**
   * Verify email delivery (called by webhook)
   */
  async verifyDelivery(deliveryId: string, status: string): Promise<{
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

      await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: {
          status: status as NotificationDeliveryStatus,
          deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
          bouncedAt: status === 'BOUNCED' ? new Date() : undefined,
        },
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
