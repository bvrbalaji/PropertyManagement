// Notification Controller
import { Request, Response } from 'express';
import notificationManagerService from '../services/notificationManagerService';
import notificationPreferenceService from '../services/notificationPreferenceService';
import notificationTemplateService from '../services/notificationTemplateService';
import pushService from '../services/pushNotificationService';
import prisma from '../config/database';
import { NotificationChannel, NotificationType } from '@prisma/client';

class NotificationController {
  /**
   * Send notification
   */
  async sendNotification(req: Request, res: Response) {
    try {
      const { notificationType, subject, body, htmlBody, channels, recipientIds, targetFloors, targetApartments, priority, scheduledFor } = req.body;
      const userId = (req as any).userId;

      const result = await notificationManagerService.createAndSendNotification({
        notificationType: notificationType as NotificationType,
        subject,
        body,
        htmlBody,
        channels: channels as NotificationChannel[],
        recipientType: recipientIds ? 'individual' : 'targeted',
        recipientIds,
        targetFloors,
        targetApartments,
        priority: priority || 'normal',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        createdBy: userId,
      });

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        data: {
          notificationId: result.notificationId,
          deliveryCount: result.deliveryCount,
          failureCount: result.failureCount,
        },
      });
    } catch (error: any) {
      console.error('Error sending notification:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Send broadcast message
   */
  async sendBroadcast(req: Request, res: Response) {
    try {
      const { propertyId, title, message, htmlMessage, targetAudience, targetFloors, targetApartments, channels } = req.body;
      const userId = (req as any).userId;

      const broadcast = await prisma.broadcastMessage.create({
        data: {
          propertyId,
          title,
          message,
          htmlMessage,
          targetAudience,
          targetFloors: targetFloors || [],
          targetApartments: targetApartments || [],
          channels: channels as NotificationChannel[],
          createdBy: userId,
        },
      });

      const result = await notificationManagerService.sendBroadcastMessage(broadcast.id);

      res.json({
        success: true,
        data: {
          broadcastId: broadcast.id,
          sentCount: result.sentCount,
        },
      });
    } catch (error: any) {
      console.error('Error sending broadcast:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get notifications for user
   */
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { status, type, limit = 20, offset = 0 } = req.query;

      const notifications = await prisma.inAppNotification.findMany({
        where: {
          userId,
          ...(type && { type: type as NotificationType }),
          ...(status && { isRead: status === 'read' }),
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(offset as string),
        take: parseInt(limit as string),
      });

      const total = await prisma.inAppNotification.count({
        where: { userId },
      });

      res.json({
        success: true,
        data: {
          notifications,
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;

      await prisma.inAppNotification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Archive notification
   */
  async archiveNotification(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;

      await prisma.inAppNotification.update({
        where: { id: notificationId },
        data: {
          isArchived: true,
          archivedAt: new Date(),
        },
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const result = await notificationPreferenceService.getPreferences(userId);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        data: result.preferences,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const updates = req.body;

      const result = await notificationPreferenceService.updatePreferences(userId, updates);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        data: result.preferences,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Set quiet hours
   */
  async setQuietHours(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { startHour, endHour } = req.body;

      const result = await notificationPreferenceService.setQuietHours(userId, startHour, endHour);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Enable digest
   */
  async enableDigest(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { type } = req.body; // 'daily' or 'weekly'

      const result = await notificationPreferenceService.enableDigest(userId, type);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Register push device
   */
  async registerDevice(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { token, deviceId, deviceType, deviceModel, osVersion, appVersion } = req.body;

      const result = await pushService.registerDevice(userId, token, {
        deviceId,
        deviceType: deviceType as 'ios' | 'android' | 'web',
        deviceModel,
        osVersion,
        appVersion,
      });

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        data: { deviceTokenId: result.deviceTokenId },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get user devices
   */
  async getUserDevices(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const result = await pushService.getUserDevices(userId);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        data: result.devices,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Unregister device
   */
  async unregisterDevice(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { deviceId } = req.params;

      const result = await pushService.unregisterDevice(userId, deviceId);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Create notification template
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { name, code, notificationType, channel, subject, body, variables, propertyId } = req.body;

      const result = await notificationTemplateService.createTemplate({
        name,
        code,
        notificationType: notificationType as NotificationType,
        channel: channel as NotificationChannel,
        subject,
        body,
        variables,
        propertyId,
        createdBy: userId,
      });

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        data: result.template,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get templates
   */
  async getTemplates(req: Request, res: Response) {
    try {
      const { propertyId, notificationType, channel } = req.query;

      const result = await notificationTemplateService.listTemplates(
        propertyId as string,
        notificationType as NotificationType,
        channel as NotificationChannel
      );

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        data: {
          templates: result.templates,
          count: result.count,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get notification statistics
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const { propertyId } = req.query;

      const result = await notificationManagerService.getStatistics(propertyId as string);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        data: result.stats,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Track push engagement
   */
  async trackEngagement(req: Request, res: Response) {
    try {
      const { deliveryId, event } = req.params;

      const result = await pushService.trackEngagement(deliveryId, event as 'opened' | 'clicked');

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new NotificationController();
