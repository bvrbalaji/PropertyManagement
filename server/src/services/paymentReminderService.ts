import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { ReminderType } from '@prisma/client';

export interface ScheduleReminderDto {
  tenantId: string;
  rentInvoiceId?: string;
  maintenanceInvoiceId?: string;
  reminderType: ReminderType;
  scheduledDate: Date;
}

export class PaymentReminderService {
  /**
   * Schedule a payment reminder
   */
  async scheduleReminder(data: ScheduleReminderDto) {
    try {
      // Validate invoice
      if (!data.rentInvoiceId && !data.maintenanceInvoiceId) {
        return { success: false, error: 'Invoice ID required' };
      }

      // Check if reminder already exists
      const existing = await prisma.paymentReminder.findFirst({
        where: {
          tenantId: data.tenantId,
          rentInvoiceId: data.rentInvoiceId,
          maintenanceInvoiceId: data.maintenanceInvoiceId,
          reminderType: data.reminderType,
        },
      });

      if (existing) {
        return { success: false, error: 'Reminder already scheduled' };
      }

      const reminder = await prisma.paymentReminder.create({
        data: {
          tenantId: data.tenantId,
          rentInvoiceId: data.rentInvoiceId,
          maintenanceInvoiceId: data.maintenanceInvoiceId,
          reminderType: data.reminderType,
          scheduledDate: data.scheduledDate,
          status: 'PENDING',
          maxRetries: 3,
          retryCount: 0,
          sentDate: null,
        },
        include: {
          tenant: true,
          rentInvoice: true,
          maintenanceInvoice: true,
        },
      });

      return { success: true, data: reminder };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule reminder',
      };
    }
  }

  /**
   * Send pending reminders (called by scheduler)
   */
  async sendPendingReminders() {
    try {
      const now = new Date();

      // Find pending reminders that are due
      const pendingReminders = await prisma.paymentReminder.findMany({
        where: {
          status: 'PENDING',
          scheduledDate: { lte: now },
        },
        include: {
          tenant: true,
          rentInvoice: true,
          maintenanceInvoice: true,
        },
      });

      let sentCount = 0;
      let failedCount = 0;

      for (const reminder of pendingReminders) {
        try {
          // TODO: Send reminder via email/SMS using emailService and smsService
          const sendResult = await this.sendReminderNotification(reminder);

          if (sendResult.success) {
            // Mark as sent
            await prisma.paymentReminder.update({
              where: { id: reminder.id },
              data: {
                status: 'SENT',
                sentDate: now,
              },
            });
            sentCount++;
          } else {
            // Increment retry count
            if (reminder.retryCount < reminder.maxRetries) {
              await prisma.paymentReminder.update({
                where: { id: reminder.id },
                data: {
                  retryCount: reminder.retryCount + 1,
                  lastRetryDate: now,
                },
              });
            } else {
              // Max retries reached, mark as failed
              await prisma.paymentReminder.update({
                where: { id: reminder.id },
                data: {
                  status: 'FAILED',
                },
              });
            }
            failedCount++;
          }
        } catch (error) {
          failedCount++;
        }
      }

      return {
        success: true,
        data: {
          sentCount,
          failedCount,
          totalProcessed: pendingReminders.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send pending reminders',
      };
    }
  }

  /**
   * Send reminder notification
   */
  private async sendReminderNotification(reminder: any) {
    try {
      let subject = '';
      let message = '';
      let invoiceDetails = {};

      if (reminder.rentInvoice) {
        invoiceDetails = {
          type: 'RENT',
          invoiceNumber: reminder.rentInvoice.invoiceNumber,
          amount: reminder.rentInvoice.rentAmount,
          dueDate: reminder.rentInvoice.dueDate,
        };
      } else if (reminder.maintenanceInvoice) {
        invoiceDetails = {
          type: 'MAINTENANCE',
          invoiceNumber: reminder.maintenanceInvoice.invoiceNumber,
          amount: reminder.maintenanceInvoice.totalAmount,
          dueDate: reminder.maintenanceInvoice.dueDate,
        };
      }

      switch (reminder.reminderType) {
        case 'INVOICE_SENT':
          subject = 'Invoice Received - Action Required';
          message = `Your invoice ${(invoiceDetails as any).invoiceNumber} has been generated. Please pay by ${new Date((invoiceDetails as any).dueDate).toLocaleDateString()}.`;
          break;

        case 'DUE_DATE_REMINDER':
          subject = 'Payment Due Today - Invoice';
          message = `Reminder: Your payment for invoice ${(invoiceDetails as any).invoiceNumber} is due today. Amount: ₹${(invoiceDetails as any).amount}`;
          break;

        case 'OVERDUE_1':
          subject = 'Overdue Payment Notice';
          message = `Your invoice ${(invoiceDetails as any).invoiceNumber} is now overdue. Please make payment immediately to avoid late charges.`;
          break;

        case 'OVERDUE_2':
          subject = 'Urgent: Overdue Payment';
          message = `Your payment for ${(invoiceDetails as any).invoiceNumber} is overdue. Late fees are being applied. Please pay now.`;
          break;

        case 'OVERDUE_3':
          subject = 'Final Notice: Overdue Payment';
          message = `Your payment is severely overdue. Please contact management immediately.`;
          break;

        default:
          return { success: false, error: 'Unknown reminder type' };
      }

      // TODO: Integrate with emailService and smsService to send actual notification
      // For now, just return success
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification',
      };
    }
  }

  /**
   * Schedule automatic reminders for invoice
   */
  async scheduleAutomaticReminders(invoiceId: string, invoiceType: 'RENT' | 'MAINTENANCE') {
    try {
      let invoice;
      let tenantId;

      if (invoiceType === 'RENT') {
        invoice = await prisma.rentInvoice.findUnique({
          where: { id: invoiceId },
        });
        if (!invoice) {
          return { success: false, error: 'Rent invoice not found' };
        }
        tenantId = invoice.tenantId;
      } else {
        invoice = await prisma.maintenanceInvoice.findUnique({
          where: { id: invoiceId },
        });
        if (!invoice) {
          return { success: false, error: 'Maintenance invoice not found' };
        }
        tenantId = invoice.tenantId;
      }

      const reminders = [];

      // Schedule invoice sent reminder (immediately)
      const sentReminder = await this.scheduleReminder({
        tenantId,
        rentInvoiceId: invoiceType === 'RENT' ? invoiceId : undefined,
        maintenanceInvoiceId: invoiceType === 'MAINTENANCE' ? invoiceId : undefined,
        reminderType: ReminderType.INVOICE_SENT,
        scheduledDate: new Date(),
      });
      if (sentReminder.success) reminders.push(sentReminder.data);

      // Schedule due date reminder (7 days before due date)
      const dueDateReminder = new Date(invoice.dueDate);
      dueDateReminder.setDate(dueDateReminder.getDate() - 7);
      const dueReminder = await this.scheduleReminder({
        tenantId,
        rentInvoiceId: invoiceType === 'RENT' ? invoiceId : undefined,
        maintenanceInvoiceId: invoiceType === 'MAINTENANCE' ? invoiceId : undefined,
        reminderType: ReminderType.DUE_DATE_REMINDER,
        scheduledDate: dueDateReminder,
      });
      if (dueReminder.success) reminders.push(dueReminder.data);

      // Schedule overdue reminders (1, 2, 3 days after due date)
      const overdueDate1 = new Date(invoice.dueDate);
      overdueDate1.setDate(overdueDate1.getDate() + 1);
      const overdueReminder1 = await this.scheduleReminder({
        tenantId,
        rentInvoiceId: invoiceType === 'RENT' ? invoiceId : undefined,
        maintenanceInvoiceId: invoiceType === 'MAINTENANCE' ? invoiceId : undefined,
        reminderType: ReminderType.OVERDUE_1,
        scheduledDate: overdueDate1,
      });
      if (overdueReminder1.success) reminders.push(overdueReminder1.data);

      const overdueDate2 = new Date(invoice.dueDate);
      overdueDate2.setDate(overdueDate2.getDate() + 2);
      const overdueReminder2 = await this.scheduleReminder({
        tenantId,
        rentInvoiceId: invoiceType === 'RENT' ? invoiceId : undefined,
        maintenanceInvoiceId: invoiceType === 'MAINTENANCE' ? invoiceId : undefined,
        reminderType: ReminderType.OVERDUE_2,
        scheduledDate: overdueDate2,
      });
      if (overdueReminder2.success) reminders.push(overdueReminder2.data);

      const overdueDate3 = new Date(invoice.dueDate);
      overdueDate3.setDate(overdueDate3.getDate() + 3);
      const overdueReminder3 = await this.scheduleReminder({
        tenantId,
        rentInvoiceId: invoiceType === 'RENT' ? invoiceId : undefined,
        maintenanceInvoiceId: invoiceType === 'MAINTENANCE' ? invoiceId : undefined,
        reminderType: ReminderType.OVERDUE_3,
        scheduledDate: overdueDate3,
      });
      if (overdueReminder3.success) reminders.push(overdueReminder3.data);

      return {
        success: true,
        data: {
          scheduledReminders: reminders.length,
          reminders,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule reminders',
      };
    }
  }

  /**
   * Get reminders for invoice
   */
  async getInvoiceReminders(invoiceId: string, invoiceType: 'RENT' | 'MAINTENANCE') {
    try {
      const where: Prisma.PaymentReminderWhereInput = {};

      if (invoiceType === 'RENT') {
        where.rentInvoiceId = invoiceId;
      } else {
        where.maintenanceInvoiceId = invoiceId;
      }

      const reminders = await prisma.paymentReminder.findMany({
        where,
        orderBy: { scheduledDate: 'asc' },
      });

      return { success: true, data: reminders };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reminders',
      };
    }
  }

  /**
   * Mark reminder as clicked/opened
   */
  async recordReminderEngagement(reminderId: string, type: 'OPENED' | 'CLICKED') {
    try {
      const data: any = {};
      if (type === 'OPENED') {
        data.openedAt = new Date();
      } else if (type === 'CLICKED') {
        data.clickedAt = new Date();
      }

      const reminder = await prisma.paymentReminder.update({
        where: { id: reminderId },
        data,
      });

      return { success: true, data: reminder };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to record engagement',
      };
    }
  }

  /**
   * Get reminder statistics
   */
  async getReminderStatistics(propertyId: string) {
    try {
      const stats = await prisma.paymentReminder.aggregate({
        where: {
          rentInvoice: { propertyId } || { maintenanceInvoice: { propertyId } },
        },
        _count: { id: true },
      });

      const byStatus = await prisma.paymentReminder.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      const byType = await prisma.paymentReminder.groupBy({
        by: ['reminderType'],
        _count: { id: true },
      });

      return {
        success: true,
        data: {
          totalReminders: stats._count.id,
          byStatus,
          byType,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get statistics',
      };
    }
  }
}

export default new PaymentReminderService();
