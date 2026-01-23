import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { InvoiceStatus } from '@prisma/client';

export interface CreateMaintenanceInvoiceDto {
  tenantId: string;
  propertyId: string;
  apartmentId: string;
  invoiceDate: Date;
  dueDate: Date;
  water?: number;
  electricity?: number;
  security?: number;
  cleaning?: number;
  other?: number;
  otherDescription?: string;
  isCombinedWithRent?: boolean;
  linkedRentInvoiceId?: string;
  notes?: string;
}

export interface UpdateMaintenanceInvoiceDto {
  water?: number;
  electricity?: number;
  security?: number;
  cleaning?: number;
  other?: number;
  otherDescription?: string;
  dueDate?: Date;
  status?: InvoiceStatus;
}

export interface MaintenanceInvoiceFilters {
  tenantId?: string;
  propertyId?: string;
  apartmentId?: string;
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
  isOverdue?: boolean;
}

export class MaintenanceInvoiceService {
  /**
   * Create a new maintenance invoice
   */
  async createInvoice(data: CreateMaintenanceInvoiceDto) {
    try {
      // Calculate total maintenance amount
      const totalAmount =
        (data.water || 0) +
        (data.electricity || 0) +
        (data.security || 0) +
        (data.cleaning || 0) +
        (data.other || 0);

      // Generate unique invoice number (format: MAINT-YYYY-MM-XXXXX)
      const yearMonth = data.invoiceDate.toISOString().slice(0, 7).replace('-', '');
      const sequence = await this.getNextSequence('MAINT', yearMonth);
      const invoiceNumber = `MAINT-${yearMonth}-${String(sequence).padStart(5, '0')}`;

      const invoice = await prisma.maintenanceInvoice.create({
        data: {
          invoiceNumber,
          tenantId: data.tenantId,
          propertyId: data.propertyId,
          apartmentId: data.apartmentId,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          water: data.water || 0,
          electricity: data.electricity || 0,
          security: data.security || 0,
          cleaning: data.cleaning || 0,
          other: data.other || 0,
          otherDescription: data.otherDescription,
          totalAmount,
          paidAmount: 0,
          remainingAmount: totalAmount,
          isCombinedWithRent: data.isCombinedWithRent || false,
          linkedRentInvoiceId: data.linkedRentInvoiceId,
          status: InvoiceStatus.DRAFT,
          isOverdue: false,
          lateFeeApplied: 0,
          notes: data.notes,
          lastReminderSent: null,
          dueReminder: false,
          overdueReminder: false,
        },
        include: {
          tenant: true,
          property: true,
          apartment: true,
        },
      });

      return {
        success: true,
        data: invoice,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      };
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId: string) {
    try {
      const invoice = await prisma.maintenanceInvoice.findUnique({
        where: { id: invoiceId },
        include: {
          tenant: true,
          property: true,
          apartment: true,
          payments: true,
          reminders: true,
          lateFees: true,
          receipts: true,
        },
      });

      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      return { success: true, data: invoice };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoice',
      };
    }
  }

  /**
   * List invoices with filters
   */
  async listInvoices(filters: MaintenanceInvoiceFilters = {}, skip = 0, take = 20) {
    try {
      const where: Prisma.MaintenanceInvoiceWhereInput = {};

      if (filters.tenantId) where.tenantId = filters.tenantId;
      if (filters.propertyId) where.propertyId = filters.propertyId;
      if (filters.apartmentId) where.apartmentId = filters.apartmentId;
      if (filters.status) where.status = filters.status;
      if (filters.isOverdue !== undefined) where.isOverdue = filters.isOverdue;

      if (filters.startDate || filters.endDate) {
        where.invoiceDate = {};
        if (filters.startDate) where.invoiceDate.gte = filters.startDate;
        if (filters.endDate) where.invoiceDate.lte = filters.endDate;
      }

      const [invoices, total] = await Promise.all([
        prisma.maintenanceInvoice.findMany({
          where,
          include: {
            tenant: true,
            property: true,
            apartment: true,
            payments: true,
            lateFees: true,
          },
          skip,
          take,
          orderBy: { invoiceDate: 'desc' },
        }),
        prisma.maintenanceInvoice.count({ where }),
      ]);

      return {
        success: true,
        data: {
          invoices,
          total,
          page: Math.floor(skip / take) + 1,
          pages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list invoices',
      };
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(invoiceId: string, data: UpdateMaintenanceInvoiceDto) {
    try {
      // Calculate new total if any charges are updated
      const invoice = await prisma.maintenanceInvoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      const newTotal =
        (data.water !== undefined ? data.water : invoice.water) +
        (data.electricity !== undefined ? data.electricity : invoice.electricity) +
        (data.security !== undefined ? data.security : invoice.security) +
        (data.cleaning !== undefined ? data.cleaning : invoice.cleaning) +
        (data.other !== undefined ? data.other : invoice.other);

      const updated = await prisma.maintenanceInvoice.update({
        where: { id: invoiceId },
        data: {
          water: data.water,
          electricity: data.electricity,
          security: data.security,
          cleaning: data.cleaning,
          other: data.other,
          otherDescription: data.otherDescription,
          totalAmount: newTotal,
          dueDate: data.dueDate,
          status: data.status,
        },
        include: {
          tenant: true,
          property: true,
          apartment: true,
        },
      });

      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update invoice',
      };
    }
  }

  /**
   * Send invoice to tenant
   */
  async sendInvoice(invoiceId: string) {
    try {
      const invoice = await prisma.maintenanceInvoice.findUnique({
        where: { id: invoiceId },
        include: { tenant: true },
      });

      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      // Update status to SENT
      const updated = await prisma.maintenanceInvoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.SENT,
          sentDate: new Date(),
        },
      });

      // TODO: Send email to tenant with invoice details

      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invoice',
      };
    }
  }

  /**
   * Mark invoice as viewed
   */
  async markAsViewed(invoiceId: string) {
    try {
      const invoice = await prisma.maintenanceInvoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.VIEWED,
          viewedAt: new Date(),
        },
      });

      return { success: true, data: invoice };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark as viewed',
      };
    }
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(invoiceId: string, reason?: string) {
    try {
      const invoice = await prisma.maintenanceInvoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelledReason: reason,
        },
      });

      return { success: true, data: invoice };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel invoice',
      };
    }
  }

  /**
   * Check and update overdue status
   */
  async checkAndUpdateOverdueStatus() {
    try {
      const now = new Date();

      // Find all invoices that should be marked as overdue
      const overdueInvoices = await prisma.maintenanceInvoice.findMany({
        where: {
          dueDate: { lt: now },
          status: {
            in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PARTIALLY_PAID],
          },
          isOverdue: false,
        },
      });

      // Bulk update overdue status
      if (overdueInvoices.length > 0) {
        await prisma.maintenanceInvoice.updateMany({
          where: {
            id: { in: overdueInvoices.map((i) => i.id) },
          },
          data: {
            isOverdue: true,
            status: InvoiceStatus.OVERDUE,
          },
        });
      }

      return {
        success: true,
        data: { updatedCount: overdueInvoices.length },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check overdue status',
      };
    }
  }

  /**
   * Get invoice summary by property
   */
  async getPropertyInvoiceSummary(propertyId: string) {
    try {
      const summary = await prisma.maintenanceInvoice.aggregate({
        where: { propertyId },
        _sum: {
          totalAmount: true,
          paidAmount: true,
          lateFeeApplied: true,
        },
        _count: {
          id: true,
        },
      });

      const byStatus = await prisma.maintenanceInvoice.groupBy({
        by: ['status'],
        where: { propertyId },
        _count: { id: true },
        _sum: { totalAmount: true },
      });

      const byChargeType = await prisma.maintenanceInvoice.aggregate({
        where: { propertyId },
        _sum: {
          water: true,
          electricity: true,
          security: true,
          cleaning: true,
          other: true,
        },
      });

      return {
        success: true,
        data: {
          totalInvoices: summary._count.id,
          totalAmount: summary._sum.totalAmount || 0,
          totalPaid: summary._sum.paidAmount || 0,
          totalLateFees: summary._sum.lateFeeApplied || 0,
          pendingAmount:
            (summary._sum.totalAmount || 0) - (summary._sum.paidAmount || 0),
          byChargeType,
          byStatus,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get summary',
      };
    }
  }

  /**
   * Generate monthly maintenance invoices for a property
   */
  async generateMonthlyInvoices(propertyId: string, month: Date) {
    try {
      // Get all maintenance fee configurations for the property
      const maintenanceConfigs = await prisma.maintenanceFeeConfig.findMany({
        where: { propertyId },
        include: {
          apartment: {
            include: {
              tenantAssignments: {
                where: {
                  startDate: { lte: month },
                  OR: [{ endDate: null }, { endDate: { gte: month } }],
                },
                include: { tenant: true },
              },
            },
          },
        },
      });

      const invoices = [];
      const invoiceDate = new Date(month.getFullYear(), month.getMonth(), 1);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 5); // Default 5 days grace period

      for (const config of maintenanceConfigs) {
        for (const assignment of config.apartment?.tenantAssignments || []) {
          const result = await this.createInvoice({
            tenantId: assignment.tenant.id,
            propertyId,
            apartmentId: config.apartmentId,
            invoiceDate,
            dueDate,
            water: config.fixedAmount || 0,
            electricity: 0,
            security: 0,
            cleaning: 0,
            other: 0,
          });

          if (result.success) {
            invoices.push(result.data);
          }
        }
      }

      return {
        success: true,
        data: {
          generatedCount: invoices.length,
          invoices,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate monthly invoices',
      };
    }
  }

  /**
   * Get next sequence number for invoice
   */
  private async getNextSequence(prefix: string, yearMonth: string) {
    const lastInvoice = await prisma.maintenanceInvoice.findFirst({
      where: {
        invoiceNumber: { startsWith: `${prefix}-${yearMonth}` },
      },
      orderBy: { invoiceNumber: 'desc' },
      take: 1,
    });

    if (!lastInvoice) {
      return 1;
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    return lastNumber + 1;
  }
}

export default new MaintenanceInvoiceService();
