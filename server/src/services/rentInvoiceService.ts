import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { InvoiceStatus, PaymentStatus } from '@prisma/client';

export interface CreateRentInvoiceDto {
  tenantId: string;
  propertyId: string;
  apartmentId: string;
  rentAmount: number;
  invoiceDate: Date;
  dueDate: Date;
  description?: string;
  notes?: string;
}

export interface UpdateRentInvoiceDto {
  rentAmount?: number;
  dueDate?: Date;
  description?: string;
  notes?: string;
  status?: InvoiceStatus;
}

export interface RentInvoiceFilters {
  tenantId?: string;
  propertyId?: string;
  apartmentId?: string;
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
  isOverdue?: boolean;
}

export class RentInvoiceService {
  /**
   * Create a new rent invoice
   */
  async createInvoice(data: CreateRentInvoiceDto) {
    try {
      // Generate unique invoice number (format: RENT-YYYY-MM-XXXXX)
      const yearMonth = data.invoiceDate.toISOString().slice(0, 7).replace('-', '');
      const sequence = await this.getNextSequence('RENT', yearMonth);
      const invoiceNumber = `RENT-${yearMonth}-${String(sequence).padStart(5, '0')}`;

      const invoice = await prisma.rentInvoice.create({
        data: {
          invoiceNumber,
          tenantId: data.tenantId,
          propertyId: data.propertyId,
          apartmentId: data.apartmentId,
          rentAmount: data.rentAmount,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          description: data.description || 'Monthly Rent Invoice',
          notes: data.notes,
          status: InvoiceStatus.DRAFT,
          paidAmount: 0,
          totalAmount: data.rentAmount,
          balanceAmount: data.rentAmount,
          isOverdue: false,
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
      const invoice = await prisma.rentInvoice.findUnique({
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
   * Get invoice by invoice number
   */
  async getInvoiceByNumber(invoiceNumber: string) {
    try {
      const invoice = await prisma.rentInvoice.findUnique({
        where: { invoiceNumber },
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
  async listInvoices(filters: RentInvoiceFilters = {}, skip = 0, take = 20) {
    try {
      const where: Prisma.RentInvoiceWhereInput = {};

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
        prisma.rentInvoice.findMany({
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
        prisma.rentInvoice.count({ where }),
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
  async updateInvoice(invoiceId: string, data: UpdateRentInvoiceDto) {
    try {
      const invoice = await prisma.rentInvoice.update({
        where: { id: invoiceId },
        data: {
          rentAmount: data.rentAmount,
          dueDate: data.dueDate,
          description: data.description,
          notes: data.notes,
          status: data.status,
        },
        include: {
          tenant: true,
          property: true,
          apartment: true,
        },
      });

      return { success: true, data: invoice };
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
      const invoice = await prisma.rentInvoice.findUnique({
        where: { id: invoiceId },
        include: { tenant: true },
      });

      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      // Update status to SENT
      const updated = await prisma.rentInvoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.SENT,
        },
      });

      // TODO: Send email to tenant with invoice details
      // This would integrate with emailService

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
      const invoice = await prisma.rentInvoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.VIEWED,
        },
      });

      return { success: true, data: invoice };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark invoice as viewed',
      };
    }
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(invoiceId: string, reason?: string) {
    try {
      const invoice = await prisma.rentInvoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.CANCELLED,
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
      const overdueInvoices = await prisma.rentInvoice.findMany({
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
        await prisma.rentInvoice.updateMany({
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
      const summary = await prisma.rentInvoice.aggregate({
        where: { propertyId },
        _sum: {
          rentAmount: true,
          paidAmount: true,
          lateFeeApplied: true,
        },
        _count: {
          id: true,
        },
      });

      const byStatus = await prisma.rentInvoice.groupBy({
        by: ['status'],
        where: { propertyId },
        _count: { id: true },
        _sum: { rentAmount: true },
      });

      return {
        success: true,
        data: {
          totalInvoices: summary._count.id,
          totalRent: summary._sum.rentAmount || 0,
          totalPaid: summary._sum.paidAmount || 0,
          totalLateFees: summary._sum.lateFeeApplied || 0,
          pendingAmount: (summary._sum.rentAmount || 0) - (summary._sum.paidAmount || 0),
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
   * Generate monthly invoices for a property
   */
  async generateMonthlyInvoices(propertyId: string, month: Date) {
    try {
      // Get all rent configurations for the property
      const rentConfigs = await prisma.rentConfig.findMany({
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
      const dueDate = new Date(
        month.getFullYear(),
        month.getMonth(),
        1 + (rentConfigs[0]?.gracePeriod || 5),
      );

      for (const config of rentConfigs) {
        for (const assignment of config.apartment?.tenantAssignments || []) {
          const result = await this.createInvoice({
            tenantId: assignment.tenant.id,
            propertyId,
            apartmentId: config.apartmentId || '',
            rentAmount: config.rentAmount,
            invoiceDate,
            dueDate,
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
    const lastInvoice = await prisma.rentInvoice.findFirst({
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

export default new RentInvoiceService();
