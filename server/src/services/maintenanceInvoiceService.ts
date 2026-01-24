import prisma from '../config/database';
import { Prisma, InvoiceStatus } from '@prisma/client';

export interface CreateMaintenanceInvoiceDto {
  tenantId: string;
  propertyId: string;
  apartmentId: string;
  invoiceDate: Date;
  dueDate: Date;
  waterCharges?: number;
  securityCharges?: number;
  cleaningCharges?: number;
  otherCharges?: number;
  maintenanceAmount?: number;
  notes?: string;
}

export interface UpdateMaintenanceInvoiceDto {
  waterCharges?: number;
  securityCharges?: number;
  cleaningCharges?: number;
  otherCharges?: number;
  maintenanceAmount?: number;
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
      const totalAmount = (data.maintenanceAmount || 0) +
        (data.waterCharges || 0) +
        (data.securityCharges || 0) +
        (data.cleaningCharges || 0) +
        (data.otherCharges || 0);

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
          maintenanceAmount: data.maintenanceAmount || 0,
          waterCharges: data.waterCharges || 0,
          securityCharges: data.securityCharges || 0,
          cleaningCharges: data.cleaningCharges || 0,
          otherCharges: data.otherCharges || 0,
          totalAmount,
          paidAmount: 0,
          balanceAmount: totalAmount,
          status: InvoiceStatus.SENT,
          isOverdue: false,
          notes: data.notes,
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
      const invoice = await prisma.maintenanceInvoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      const newTotal =
        (data.maintenanceAmount !== undefined ? data.maintenanceAmount : invoice.maintenanceAmount) +
        (data.waterCharges !== undefined ? data.waterCharges : invoice.waterCharges) +
        (data.securityCharges !== undefined ? data.securityCharges : invoice.securityCharges) +
        (data.cleaningCharges !== undefined ? data.cleaningCharges : invoice.cleaningCharges) +
        (data.otherCharges !== undefined ? data.otherCharges : invoice.otherCharges);

      const updated = await prisma.maintenanceInvoice.update({
        where: { id: invoiceId },
        data: {
          maintenanceAmount: data.maintenanceAmount,
          waterCharges: data.waterCharges,
          securityCharges: data.securityCharges,
          cleaningCharges: data.cleaningCharges,
          otherCharges: data.otherCharges,
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
          dueReminder: false,
          overdueReminder: false,
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
   * Check and update overdue status
   */
  async checkAndUpdateOverdueStatus() {
    try {
      const now = new Date();

      // Find all invoices that should be marked as overdue
      const overdueInvoices = await prisma.maintenanceInvoice.findMany({
        where: {
          dueDate: { lt: now },
          status: { in: [InvoiceStatus.SENT] },
          isOverdue: false,
        },
      });

      // Bulk update overdue status
      if (overdueInvoices.length > 0) {
        await prisma.maintenanceInvoice.updateMany({
          where: {
            id: { in: overdueInvoices.map((i: any) => i.id) },
          },
          data: {
            isOverdue: true,
            status: InvoiceStatus.SENT,
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

      return {
        success: true,
        data: {
          totalInvoices: summary._count?.id || 0,
          totalAmount: summary._sum?.totalAmount || 0,
          totalPaid: summary._sum?.paidAmount || 0,
          pendingAmount:
            (summary._sum?.totalAmount || 0) - (summary._sum?.paidAmount || 0),
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
      dueDate.setDate(dueDate.getDate() + 5); // Default 5 days due

      for (const config of maintenanceConfigs) {
        for (const assignment of config.apartment?.tenantAssignments || []) {
          const result = await this.createInvoice({
            tenantId: assignment.tenant.id,
            propertyId,
            apartmentId: config.apartmentId || '',
            invoiceDate,
            dueDate,
            maintenanceAmount: config.maintenanceAmount,
            waterCharges: config.waterCharges || 0,
            securityCharges: config.securityCharges || 0,
            cleaningCharges: config.cleaningCharges || 0,
            otherCharges: config.otherCharges || 0,
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
