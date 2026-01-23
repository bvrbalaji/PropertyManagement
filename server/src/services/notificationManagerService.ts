// Notification Manager Service - Orchestrates multi-channel notifications
import prisma from '../config/database';
import emailService from './emailNotificationService';
import smsService from './smsNotificationService';
// import pushService from './pushNotificationService'; // TODO: Enable push notifications later
import {
  Notification,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  NotificationDeliveryStatus,
} from '@prisma/client';

interface CreateNotificationInput {
  propertyId?: string;
  notificationType: NotificationType;
  subject: string;
  body: string;
  htmlBody?: string;
  channels: NotificationChannel[];
  recipientType: 'individual' | 'broadcast' | 'targeted';
  recipientIds?: string[];
  targetFloors?: string[];
  targetApartments?: string[];
  templateId?: string;
  templateVariables?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: Date;
  createdBy: string;
}

class NotificationManagerService {
  /**
   * Create and send notification
   */
  async createAndSendNotification(input: CreateNotificationInput): Promise<{
    success: boolean;
    notificationId?: string;
    deliveryCount?: number;
    failureCount?: number;
    error?: string;
  }> {
    try {
      // Get recipients based on targeting
      const recipients = await this.getRecipients(input);

      if (recipients.length === 0) {
        return {
          success: false,
          error: 'No recipients found',
        };
      }

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          propertyId: input.propertyId,
          notificationType: input.notificationType,
          subject: input.subject,
          body: input.body,
          htmlBody: input.htmlBody,
          channels: input.channels,
          recipientType: input.recipientType,
          recipientIds: recipients.map(r => r.id),
          targetFloors: input.targetFloors || [],
          targetApartments: input.targetApartments || [],
          templateId: input.templateId,
          templateVariables: input.templateVariables,
          totalRecipients: recipients.length,
          priority: input.priority || 'normal',
          status: input.scheduledFor ? NotificationStatus.SCHEDULED : NotificationStatus.QUEUED,
          scheduledFor: input.scheduledFor,
          createdBy: input.createdBy,
        },
      });

      // If scheduled, return early
      if (input.scheduledFor) {
        return {
          success: true,
          notificationId: notification.id,
        };
      }

      // Send notifications immediately
      const result = await this.sendNotification(notification.id, recipients);

      return {
        success: result.success,
        notificationId: notification.id,
        deliveryCount: result.deliveryCount,
        failureCount: result.failureCount,
      };
    } catch (error: any) {
      console.error('[NotificationManager] Error creating notification:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send notification to recipients
   */
  private async sendNotification(
    notificationId: string,
    recipients: any[]
  ): Promise<{
    success: boolean;
    deliveryCount: number;
    failureCount: number;
  }> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    let deliveryCount = 0;
    let failureCount = 0;

    // Send via each channel
    for (const channel of notification.channels) {
      for (const recipient of recipients) {
        try {
          let result: any;

          if (channel === NotificationChannel.EMAIL) {
            result = await emailService.sendEmail({
              recipientEmail: recipient.email,
              subject: notification.subject,
              htmlBody: notification.htmlBody || this.convertToHtml(notification.body),
              recipientId: recipient.id,
              notificationId,
            });
          } else if (channel === NotificationChannel.SMS) {
            // Check SMS preference and phone
            const preference = await prisma.notificationPreference.findUnique({
              where: { userId: recipient.id },
            });

            if (preference?.smsEnabled && recipient.phone) {
              result = await smsService.sendSMS({
                recipientPhone: recipient.phone,
                message: this.truncateSMS(notification.body),
                recipientId: recipient.id,
                notificationId,
              });
            } else {
              continue;
            }
          } else if (channel === NotificationChannel.PUSH) {
            // Push notifications disabled - enable later
            // result = await pushService.sendPush({
            //   recipientId: recipient.id,
            //   notificationId,
            //   title: notification.subject,
            //   body: notification.body,
            // });
            result = { success: true, deliveryId: 'disabled' }; // Temporarily skip
          } else if (channel === NotificationChannel.IN_APP) {
            result = await this.createInAppNotification({
              userId: recipient.id,
              title: notification.subject,
              message: notification.body,
              type: notification.notificationType,
              priority: notification.priority,
              notificationId,
            });
          }

          if (result?.success || result?.deliveryIds) {
            deliveryCount++;
          } else {
            failureCount++;
          }
        } catch (error: any) {
          console.error(`[NotificationManager] Error sending ${channel}:`, error);
          failureCount++;
        }
      }
    }

    // Update notification with counts
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        sentCount: deliveryCount,
        failedCount: failureCount,
        sentAt: new Date(),
        status: NotificationStatus.SENT,
      },
    });

    return {
      success: failureCount === 0,
      deliveryCount,
      failureCount,
    };
  }

  /**
   * Get recipients based on targeting
   */
  private async getRecipients(input: CreateNotificationInput): Promise<any[]> {
    if (input.recipientType === 'individual' && input.recipientIds) {
      return await prisma.user.findMany({
        where: { id: { in: input.recipientIds } },
        select: { id: true, email: true, phone: true },
      });
    }

    if (input.recipientType === 'broadcast') {
      // Get all users in property
      const tenantAssignments = await prisma.tenantAssignment.findMany({
        where: input.propertyId
          ? { apartment: { propertyId: input.propertyId } }
          : {},
        select: { tenantId: true },
      });

      const tenantIds = tenantAssignments.map(ta => ta.tenantId);

      return await prisma.user.findMany({
        where: { id: { in: tenantIds } },
        select: { id: true, email: true, phone: true },
      });
    }

    if (input.recipientType === 'targeted') {
      // Get users in specific floors/apartments
      const apartments = await prisma.apartment.findMany({
        where: {
          AND: [
            input.propertyId ? { propertyId: input.propertyId } : {},
            input.targetFloors?.length ? { floor: { in: input.targetFloors.map(Number) } } : {},
            input.targetApartments?.length ? { id: { in: input.targetApartments } } : {},
          ],
        },
      });

      const apartmentIds = apartments.map(a => a.id);

      const tenantAssignments = await prisma.tenantAssignment.findMany({
        where: { apartmentId: { in: apartmentIds } },
        select: { tenantId: true },
      });

      const tenantIds = tenantAssignments.map(ta => ta.tenantId);

      return await prisma.user.findMany({
        where: { id: { in: tenantIds } },
        select: { id: true, email: true, phone: true },
      });
    }

    return [];
  }

  /**
   * Send scheduled notifications
   */
  async sendScheduledNotifications(): Promise<{
    success: boolean;
    sentCount: number;
    failureCount: number;
  }> {
    try {
      const now = new Date();

      // Get scheduled notifications ready to send
      const scheduledNotifications = await prisma.notification.findMany({
        where: {
          status: NotificationStatus.SCHEDULED,
          scheduledFor: {
            lte: now,
          },
        },
      });

      let sentCount = 0;
      let failureCount = 0;

      for (const notification of scheduledNotifications) {
        try {
          const recipients = await prisma.user.findMany({
            where: { id: { in: notification.recipientIds } },
            select: { id: true, email: true, phone: true },
          });

          const result = await this.sendNotification(notification.id, recipients);

          sentCount += result.deliveryCount;
          failureCount += result.failureCount;
        } catch (error: any) {
          console.error(`[NotificationManager] Error sending scheduled:`, error);
          failureCount++;
        }
      }

      return {
        success: failureCount === 0,
        sentCount,
        failureCount,
      };
    } catch (error: any) {
      console.error('[NotificationManager] Error in sendScheduledNotifications:', error);
      return {
        success: false,
        sentCount: 0,
        failureCount: 0,
      };
    }
  }

  /**
   * Send broadcast message
   */
  async sendBroadcastMessage(broadcastId: string): Promise<{
    success: boolean;
    sentCount?: number;
    error?: string;
  }> {
    try {
      const broadcast = await prisma.broadcastMessage.findUnique({
        where: { id: broadcastId },
      });

      if (!broadcast) {
        return { success: false, error: 'Broadcast message not found' };
      }

      // Get recipients
      const recipients = await this.getRecipients({
        propertyId: broadcast.propertyId,
        notificationType: NotificationType.BROADCAST,
        recipientType: broadcast.targetAudience as any,
        targetFloors: broadcast.targetFloors,
        targetApartments: broadcast.targetApartments,
        subject: broadcast.title,
        body: broadcast.message,
        channels: broadcast.channels,
        createdBy: broadcast.createdBy,
      });

      // Create notifications for each channel
      let sentCount = 0;

      for (const channel of broadcast.channels) {
        if (channel === NotificationChannel.IN_APP) {
          for (const recipient of recipients) {
            if (!broadcast.excludeUsers.includes(recipient.id)) {
              await this.createInAppNotification({
                userId: recipient.id,
                title: broadcast.title,
                message: broadcast.message,
                type: NotificationType.BROADCAST,
                relatedId: broadcastId,
              });
              sentCount++;
            }
          }
        }
      }

      // Update broadcast
      await prisma.broadcastMessage.update({
        where: { id: broadcastId },
        data: {
          sentAt: new Date(),
          viewCount: 0,
        },
      });

      return {
        success: true,
        sentCount,
      };
    } catch (error: any) {
      console.error('[NotificationManager] Error sending broadcast:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create in-app notification
   */
  private async createInAppNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: string;
    relatedId?: string;
    notificationId?: string;
  }): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await prisma.inAppNotification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority || 'normal',
          relatedId: data.relatedId,
        },
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Retry failed deliveries
   */
  async retryFailedDeliveries(): Promise<{
    success: boolean;
    retriedCount: number;
    error?: string;
  }> {
    try {
      const failedDeliveries = await prisma.notificationDelivery.findMany({
        where: {
          status: NotificationDeliveryStatus.FAILED,
          retryCount: { lt: 3 },
          nextRetryAt: { lte: new Date() },
        },
        include: { notification: true, recipient: true },
      });

      let retriedCount = 0;

      for (const delivery of failedDeliveries) {
        try {
          if (delivery.channel === NotificationChannel.EMAIL) {
            await emailService.sendEmail({
              recipientEmail: delivery.destination,
              subject: delivery.notification.subject,
              htmlBody: delivery.notification.htmlBody || this.convertToHtml(delivery.notification.body),
              recipientId: delivery.recipientId,
              notificationId: delivery.notificationId,
            });
          } else if (delivery.channel === NotificationChannel.SMS) {
            await smsService.sendSMS({
              recipientPhone: delivery.destination,
              message: this.truncateSMS(delivery.notification.body),
              recipientId: delivery.recipientId,
              notificationId: delivery.notificationId,
            });
          }

          retriedCount++;
        } catch (error: any) {
          console.error('[NotificationManager] Retry failed:', error);
          
          // Increment retry count
          await prisma.notificationDelivery.update({
            where: { id: delivery.id },
            data: {
              retryCount: delivery.retryCount + 1,
              nextRetryAt: new Date(Date.now() + 10 * 60 * 1000), // Retry in 10 mins
            },
          });
        }
      }

      return {
        success: true,
        retriedCount,
      };
    } catch (error: any) {
      console.error('[NotificationManager] Error in retryFailedDeliveries:', error);
      return {
        success: false,
        retriedCount: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get notification statistics
   */
  async getStatistics(propertyId?: string): Promise<{
    success: boolean;
    stats?: {
      totalSent: number;
      totalDelivered: number;
      totalFailed: number;
      deliveryRate: number;
      openRate: number;
      clickRate: number;
      byChannel: Record<string, any>;
      byType: Record<string, number>;
    };
    error?: string;
  }> {
    try {
      const whereClause = propertyId ? { propertyId } : {};

      const notifications = await prisma.notification.findMany({
        where: whereClause,
      });

      const deliveries = await prisma.notificationDelivery.findMany({
        where: propertyId
          ? {
              notification: {
                propertyId,
              },
            }
          : {},
      });

      const totalSent = deliveries.filter(d => d.sentAt).length;
      const totalDelivered = deliveries.filter(
        d => d.status === NotificationDeliveryStatus.DELIVERED
      ).length;
      const totalFailed = deliveries.filter(
        d => d.status === NotificationDeliveryStatus.FAILED
      ).length;
      const totalOpened = deliveries.filter(d => d.openedAt).length;
      const totalClicked = deliveries.filter(d => d.clickedAt).length;

      const stats = {
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(2) : '0',
        openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : '0',
        clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : '0',
        byChannel: this.groupByChannel(deliveries),
        byType: this.groupByType(notifications),
      };

      return {
        success: true,
        stats,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private groupByChannel(deliveries: any[]): Record<string, any> {
    const result: Record<string, any> = {};

    for (const channel of Object.values(NotificationChannel)) {
      const channelDeliveries = deliveries.filter(d => d.channel === channel);
      result[channel] = {
        total: channelDeliveries.length,
        sent: channelDeliveries.filter(d => d.sentAt).length,
        delivered: channelDeliveries.filter(
          d => d.status === NotificationDeliveryStatus.DELIVERED
        ).length,
        failed: channelDeliveries.filter(
          d => d.status === NotificationDeliveryStatus.FAILED
        ).length,
      };
    }

    return result;
  }

  private groupByType(notifications: any[]): Record<string, number> {
    const result: Record<string, number> = {};

    for (const notification of notifications) {
      result[notification.notificationType] =
        (result[notification.notificationType] || 0) + 1;
    }

    return result;
  }

  private convertToHtml(text: string): string {
    return `<html><body>${text.replace(/\n/g, '<br>')}</body></html>`;
  }

  private truncateSMS(text: string): string {
    return text.substring(0, 160);
  }
}

export default new NotificationManagerService();
