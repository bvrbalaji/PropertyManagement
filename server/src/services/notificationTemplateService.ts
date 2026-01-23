// Notification Template Service
import prisma from '../config/database';
import { NotificationTemplate, NotificationType, NotificationChannel } from '@prisma/client';

interface CreateTemplateInput {
  name: string;
  code: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  subject: string;
  body: string;
  variables?: Record<string, string>;
  propertyId?: string;
  createdBy: string;
}

class NotificationTemplateService {
  /**
   * Create notification template
   */
  async createTemplate(input: CreateTemplateInput): Promise<{
    success: boolean;
    template?: NotificationTemplate;
    error?: string;
  }> {
    try {
      // Check if code already exists
      const existing = await prisma.notificationTemplate.findUnique({
        where: { code: input.code },
      });

      if (existing) {
        return {
          success: false,
          error: 'Template code already exists',
        };
      }

      const template = await prisma.notificationTemplate.create({
        data: {
          name: input.name,
          code: input.code,
          notificationType: input.notificationType,
          channel: input.channel,
          subject: input.subject,
          body: input.body,
          variables: input.variables || {},
          propertyId: input.propertyId,
          createdBy: input.createdBy,
          isActive: true,
          version: 1,
        },
      });

      return {
        success: true,
        template,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get template by code
   */
  async getTemplateByCode(code: string, propertyId?: string): Promise<{
    success: boolean;
    template?: NotificationTemplate;
    error?: string;
  }> {
    try {
      const template = await prisma.notificationTemplate.findFirst({
        where: {
          code,
          isActive: true,
          OR: [
            { propertyId: propertyId },
            { propertyId: null },
          ],
        },
        orderBy: {
          propertyId: propertyId ? 'desc' : 'asc', // Property-specific first
        },
      });

      if (!template) {
        return {
          success: false,
          error: 'Template not found',
        };
      }

      return {
        success: true,
        template,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string): Promise<{
    success: boolean;
    template?: NotificationTemplate;
    error?: string;
  }> {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return {
          success: false,
          error: 'Template not found',
        };
      }

      return {
        success: true,
        template,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List templates
   */
  async listTemplates(
    propertyId?: string,
    notificationType?: NotificationType,
    channel?: NotificationChannel
  ): Promise<{
    success: boolean;
    templates?: NotificationTemplate[];
    count?: number;
    error?: string;
  }> {
    try {
      const templates = await prisma.notificationTemplate.findMany({
        where: {
          isActive: true,
          ...(propertyId && {
            OR: [
              { propertyId },
              { propertyId: null },
            ],
          }),
          ...(notificationType && { notificationType }),
          ...(channel && { channel }),
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        templates,
        count: templates.length,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updates: {
      name?: string;
      subject?: string;
      body?: string;
      variables?: Record<string, string>;
      updatedBy: string;
    }
  ): Promise<{
    success: boolean;
    template?: NotificationTemplate;
    error?: string;
  }> {
    try {
      const existing = await prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      });

      if (!existing) {
        return {
          success: false,
          error: 'Template not found',
        };
      }

      // Create new version
      const updated = await prisma.notificationTemplate.update({
        where: { id: templateId },
        data: {
          name: updates.name || existing.name,
          subject: updates.subject || existing.subject,
          body: updates.body || existing.body,
          variables: updates.variables || existing.variables,
          version: existing.version + 1,
          updatedBy: updates.updatedBy,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        template: updated,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete template (soft delete)
   */
  async deleteTemplate(templateId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await prisma.notificationTemplate.update({
        where: { id: templateId },
        data: {
          isActive: false,
          updatedAt: new Date(),
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
   * Render template with variables
   */
  async renderTemplate(
    templateId: string,
    variables: Record<string, any>
  ): Promise<{
    success: boolean;
    subject?: string;
    body?: string;
    error?: string;
  }> {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return {
          success: false,
          error: 'Template not found',
        };
      }

      let subject = template.subject;
      let body = template.body;

      // Replace variables
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{${key}}`, 'g');
        subject = subject.replace(regex, String(value));
        body = body.replace(regex, String(value));
      }

      return {
        success: true,
        subject,
        body,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get system templates
   */
  async getSystemTemplates(): Promise<{
    success: boolean;
    templates?: NotificationTemplate[];
    error?: string;
  }> {
    try {
      const templates = await prisma.notificationTemplate.findMany({
        where: {
          propertyId: null,
          isActive: true,
        },
        orderBy: { notificationType: 'asc' },
      });

      return {
        success: true,
        templates,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get default system templates
   */
  async initializeDefaultTemplates(): Promise<{
    success: boolean;
    createdCount: number;
    error?: string;
  }> {
    try {
      const defaultTemplates = [
        {
          name: 'Invoice Created - Email',
          code: 'INVOICE_CREATED_EMAIL',
          notificationType: NotificationType.INVOICE_CREATED,
          channel: NotificationChannel.EMAIL,
          subject: 'New Invoice - {propertyName}',
          body: 'Dear {tenantName},\n\nA new invoice has been created for {propertyName}.\n\nAmount: {invoiceAmount}\nDue Date: {dueDate}\n\nPlease make payment as soon as possible.',
          variables: {
            tenantName: 'Name of tenant',
            propertyName: 'Name of property',
            invoiceAmount: 'Invoice amount',
            dueDate: 'Due date',
          },
        },
        {
          name: 'Payment Reminder - SMS',
          code: 'PAYMENT_REMINDER_SMS',
          notificationType: NotificationType.PAYMENT_REMINDER,
          channel: NotificationChannel.SMS,
          subject: 'Payment Reminder',
          body: 'Hi {tenantName}, This is a reminder to pay your {propertyName} invoice of {invoiceAmount} due on {dueDate}.',
          variables: {
            tenantName: 'Name of tenant',
            propertyName: 'Name of property',
            invoiceAmount: 'Invoice amount',
            dueDate: 'Due date',
          },
        },
        {
          name: 'Payment Received - Email',
          code: 'PAYMENT_RECEIVED_EMAIL',
          notificationType: NotificationType.PAYMENT_RECEIVED,
          channel: NotificationChannel.EMAIL,
          subject: 'Payment Received - {propertyName}',
          body: 'Dear {tenantName},\n\nWe have received your payment of {paymentAmount} for {propertyName}.\n\nReceipt No: {receiptNo}\nPayment Date: {paymentDate}',
          variables: {
            tenantName: 'Name of tenant',
            propertyName: 'Name of property',
            paymentAmount: 'Payment amount',
            receiptNo: 'Receipt number',
            paymentDate: 'Payment date',
          },
        },
        {
          name: 'Overdue Notice - Email',
          code: 'OVERDUE_NOTICE_EMAIL',
          notificationType: NotificationType.OVERDUE_NOTICE,
          channel: NotificationChannel.EMAIL,
          subject: 'Overdue Payment Notice - {propertyName}',
          body: 'Dear {tenantName},\n\nYour payment for {propertyName} is now overdue.\n\nAmount Due: {amountDue}\nDays Overdue: {daysOverdue}\n\nPlease make payment immediately to avoid further penalties.',
          variables: {
            tenantName: 'Name of tenant',
            propertyName: 'Name of property',
            amountDue: 'Amount due',
            daysOverdue: 'Days overdue',
          },
        },
        {
          name: 'Maintenance Alert - Push',
          code: 'MAINTENANCE_ALERT_PUSH',
          notificationType: NotificationType.MAINTENANCE_ALERT,
          channel: NotificationChannel.PUSH,
          subject: 'Maintenance Alert',
          body: 'A maintenance request requires your attention: {maintenanceType} - {description}',
          variables: {
            maintenanceType: 'Type of maintenance',
            description: 'Description',
          },
        },
      ];

      let createdCount = 0;

      for (const template of defaultTemplates) {
        const existing = await prisma.notificationTemplate.findFirst({
          where: { code: template.code },
        });

        if (!existing) {
          await prisma.notificationTemplate.create({
            data: {
              ...template,
              createdBy: 'SYSTEM',
              isActive: true,
              version: 1,
            },
          });

          createdCount++;
        }
      }

      return {
        success: true,
        createdCount,
      };
    } catch (error: any) {
      return {
        success: false,
        createdCount: 0,
        error: error.message,
      };
    }
  }
}

export default new NotificationTemplateService();
