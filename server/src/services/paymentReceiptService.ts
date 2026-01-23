import prisma from '../config/database';

export interface GenerateReceiptDto {
  paymentId: string;
  pdfUrl?: string;
}

export class PaymentReceiptService {
  /**
   * Generate receipt for payment
   */
  async generateReceipt(data: GenerateReceiptDto) {
    try {
      // Get payment details
      const payment = await prisma.payment.findUnique({
        where: { id: data.paymentId },
        include: {
          tenant: true,
          rentInvoice: true,
          maintenanceInvoice: true,
        },
      });

      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      if (payment.status !== 'SUCCESS') {
        return { success: false, error: 'Receipt can only be generated for successful payments' };
      }

      // Check if receipt already exists
      const existing = await prisma.paymentReceipt.findFirst({
        where: { paymentId: data.paymentId },
      });

      if (existing) {
        return { success: true, data: existing, message: 'Receipt already exists' };
      }

      // Generate receipt number (format: RCP-YYYYMMDD-XXXXX)
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const sequence = await this.getNextReceiptSequence(dateStr);
      const receiptNumber = `RCP-${dateStr}-${String(sequence).padStart(5, '0')}`;

      // Create receipt record
      const receipt = await prisma.paymentReceipt.create({
        data: {
          paymentId: data.paymentId,
          receiptNumber,
          pdfUrl: data.pdfUrl || `https://receipts.example.com/${receiptNumber}.pdf`,
          emailSent: false,
          emailStatus: 'PENDING',
          emailFailureReason: null,
          sentAt: null,
          bouncedAt: null,
          openedAt: null,
          clickedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          payment: {
            include: {
              tenant: true,
              rentInvoice: true,
              maintenanceInvoice: true,
            },
          },
        },
      });

      // TODO: Send receipt email asynchronously
      // In a real implementation, this would queue the email sending task

      return { success: true, data: receipt };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate receipt',
      };
    }
  }

  /**
   * Get receipt by ID
   */
  async getReceiptById(receiptId: string) {
    try {
      const receipt = await prisma.paymentReceipt.findUnique({
        where: { id: receiptId },
        include: {
          payment: {
            include: {
              tenant: true,
              rentInvoice: true,
              maintenanceInvoice: true,
            },
          },
        },
      });

      if (!receipt) {
        return { success: false, error: 'Receipt not found' };
      }

      return { success: true, data: receipt };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch receipt',
      };
    }
  }

  /**
   * Get receipt by receipt number
   */
  async getReceiptByNumber(receiptNumber: string) {
    try {
      const receipt = await prisma.paymentReceipt.findUnique({
        where: { receiptNumber },
        include: {
          payment: {
            include: {
              tenant: true,
              rentInvoice: true,
              maintenanceInvoice: true,
            },
          },
        },
      });

      if (!receipt) {
        return { success: false, error: 'Receipt not found' };
      }

      return { success: true, data: receipt };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch receipt',
      };
    }
  }

  /**
   * Get receipts for tenant
   */
  async getTenantReceipts(tenantId: string) {
    try {
      const receipts = await prisma.paymentReceipt.findMany({
        where: {
          payment: { tenantId },
        },
        include: {
          payment: {
            include: {
              rentInvoice: true,
              maintenanceInvoice: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, data: receipts };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch receipts',
      };
    }
  }

  /**
   * Mark receipt email as sent
   */
  async markEmailSent(receiptId: string) {
    try {
      const receipt = await prisma.paymentReceipt.update({
        where: { id: receiptId },
        data: {
          emailSent: true,
          emailStatus: 'SENT',
          sentAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { success: true, data: receipt };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update receipt',
      };
    }
  }

  /**
   * Mark receipt email as failed
   */
  async markEmailFailed(receiptId: string, reason: string) {
    try {
      const receipt = await prisma.paymentReceipt.update({
        where: { id: receiptId },
        data: {
          emailStatus: 'FAILED',
          emailFailureReason: reason,
          updatedAt: new Date(),
        },
      });

      return { success: true, data: receipt };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update receipt',
      };
    }
  }

  /**
   * Mark receipt email as bounced
   */
  async markEmailBounced(receiptId: string) {
    try {
      const receipt = await prisma.paymentReceipt.update({
        where: { id: receiptId },
        data: {
          emailStatus: 'BOUNCED',
          bouncedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { success: true, data: receipt };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update receipt',
      };
    }
  }

  /**
   * Record receipt opened
   */
  async recordReceiptOpened(receiptId: string) {
    try {
      const receipt = await prisma.paymentReceipt.update({
        where: { id: receiptId },
        data: {
          openedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { success: true, data: receipt };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update receipt',
      };
    }
  }

  /**
   * Record receipt link clicked
   */
  async recordReceiptClicked(receiptId: string) {
    try {
      const receipt = await prisma.paymentReceipt.update({
        where: { id: receiptId },
        data: {
          clickedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { success: true, data: receipt };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update receipt',
      };
    }
  }

  /**
   * Get receipt statistics
   */
  async getReceiptStatistics(propertyId: string) {
    try {
      const stats = await prisma.paymentReceipt.aggregate({
        where: {
          payment: { propertyId },
        },
        _count: { id: true },
      });

      const bySendStatus = await prisma.paymentReceipt.groupBy({
        by: ['emailStatus'],
        where: {
          payment: { propertyId },
        },
        _count: { id: true },
      });

      // Count opened and clicked
      const opened = await prisma.paymentReceipt.count({
        where: {
          payment: { propertyId },
          openedAt: { not: null },
        },
      });

      const clicked = await prisma.paymentReceipt.count({
        where: {
          payment: { propertyId },
          clickedAt: { not: null },
        },
      });

      return {
        success: true,
        data: {
          totalReceipts: stats._count.id,
          bySendStatus,
          opened,
          clicked,
          openRate:
            stats._count.id > 0
              ? Math.round((opened / stats._count.id) * 100)
              : 0,
          clickRate:
            stats._count.id > 0
              ? Math.round((clicked / stats._count.id) * 100)
              : 0,
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

  /**
   * Send pending receipts (called by scheduler)
   */
  async sendPendingReceipts() {
    try {
      // Get all receipts that haven't been sent
      const pendingReceipts = await prisma.paymentReceipt.findMany({
        where: {
          emailStatus: 'PENDING',
          createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
        },
        include: {
          payment: {
            include: {
              tenant: true,
              rentInvoice: true,
              maintenanceInvoice: true,
            },
          },
        },
      });

      let sentCount = 0;
      let failedCount = 0;

      for (const receipt of pendingReceipts) {
        try {
          // TODO: Send email with receipt using emailService
          // For now, just mark as sent
          await this.markEmailSent(receipt.id);
          sentCount++;
        } catch (error) {
          await this.markEmailFailed(
            receipt.id,
            error instanceof Error ? error.message : 'Unknown error',
          );
          failedCount++;
        }
      }

      return {
        success: true,
        data: {
          sentCount,
          failedCount,
          totalProcessed: pendingReceipts.length,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send pending receipts',
      };
    }
  }

  /**
   * Get next receipt sequence number
   */
  private async getNextReceiptSequence(dateStr: string) {
    const lastReceipt = await prisma.paymentReceipt.findFirst({
      where: {
        receiptNumber: { startsWith: `RCP-${dateStr}` },
      },
      orderBy: { receiptNumber: 'desc' },
      take: 1,
    });

    if (!lastReceipt) {
      return 1;
    }

    const lastNumber = parseInt(lastReceipt.receiptNumber.split('-')[2]);
    return lastNumber + 1;
  }
}

export default new PaymentReceiptService();
