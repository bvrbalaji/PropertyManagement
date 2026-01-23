import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export interface CalculateLateFeeDto {
  invoiceId: string;
  invoiceType: 'RENT' | 'MAINTENANCE';
  daysOverdue: number;
}

export interface ApplyLateFeeDto {
  invoiceId: string;
  invoiceType: 'RENT' | 'MAINTENANCE';
  lateFeeAmount: number;
  reason?: string;
}

export interface WaiveLateFeeDto {
  lateFeeId: string;
  reason: string;
  waivedBy: string;
}

export class LateFeeService {
  /**
   * Calculate late fee for an invoice
   */
  async calculateLateFee(data: CalculateLateFeeDto) {
    try {
      // Get invoice
      let invoice;
      let config;

      if (data.invoiceType === 'RENT') {
        invoice = await prisma.rentInvoice.findUnique({
          where: { id: data.invoiceId },
          include: { property: true },
        });

        if (!invoice) {
          return { success: false, error: 'Rent invoice not found' };
        }

        // Get rent configuration for late fee rules
        config = await prisma.rentConfig.findFirst({
          where: {
            propertyId: invoice.propertyId,
            apartmentId: invoice.apartmentId,
          },
        });
      } else {
        invoice = await prisma.maintenanceInvoice.findUnique({
          where: { id: data.invoiceId },
          include: { property: true },
        });

        if (!invoice) {
          return { success: false, error: 'Maintenance invoice not found' };
        }

        // Get maintenance configuration for late fee rules
        config = await prisma.maintenanceFeeConfig.findFirst({
          where: {
            propertyId: invoice.propertyId,
            apartmentId: invoice.apartmentId,
          },
        });
      }

      if (!config) {
        return {
          success: false,
          error: 'Configuration not found for calculating late fees',
        };
      }

      // Calculate late fee based on configuration
      let lateFeeAmount = 0;
      let calculationMethod = 'NONE';

      if (config.lateFeeCalculationMethod) {
        const invoiceAmount =
          data.invoiceType === 'RENT'
            ? (invoice as any).rentAmount
            : (invoice as any).totalAmount;

        switch (config.lateFeeCalculationMethod) {
          case 'FLAT':
            lateFeeAmount = config.lateFeeAmount || 0;
            calculationMethod = 'FLAT';
            break;

          case 'PERCENT_PER_DAY':
            const dailyPercent = (config.lateFeePercent || 0) / 100;
            lateFeeAmount = invoiceAmount * dailyPercent * data.daysOverdue;
            calculationMethod = 'PERCENT_PER_DAY';
            break;

          case 'PERCENT_PER_MONTH':
            const monthlyPercent = (config.lateFeePercent || 0) / 100;
            const monthsOverdue = Math.ceil(data.daysOverdue / 30);
            lateFeeAmount = invoiceAmount * monthlyPercent * monthsOverdue;
            calculationMethod = 'PERCENT_PER_MONTH';
            break;

          default:
            lateFeeAmount = 0;
        }

        // Apply max cap if configured
        if (config.lateFeeMaxCap && lateFeeAmount > config.lateFeeMaxCap) {
          lateFeeAmount = config.lateFeeMaxCap;
        }
      }

      return {
        success: true,
        data: {
          lateFeeAmount: Math.round(lateFeeAmount * 100) / 100,
          daysOverdue: data.daysOverdue,
          calculationMethod,
          config: {
            method: config.lateFeeCalculationMethod,
            flatAmount: config.lateFeeAmount,
            percent: config.lateFeePercent,
            maxCap: config.lateFeeMaxCap,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate late fee',
      };
    }
  }

  /**
   * Apply late fee to invoice
   */
  async applyLateFee(data: ApplyLateFeeDto) {
    try {
      // Get invoice
      let invoice;
      let tenantId;

      if (data.invoiceType === 'RENT') {
        invoice = await prisma.rentInvoice.findUnique({
          where: { id: data.invoiceId },
        });
        if (!invoice) {
          return { success: false, error: 'Rent invoice not found' };
        }
        tenantId = invoice.tenantId;
      } else {
        invoice = await prisma.maintenanceInvoice.findUnique({
          where: { id: data.invoiceId },
        });
        if (!invoice) {
          return { success: false, error: 'Maintenance invoice not found' };
        }
        tenantId = invoice.tenantId;
      }

      // Create late fee record
      const lateFee = await prisma.lateFee.create({
        data: {
          tenantId,
          rentInvoiceId: data.invoiceType === 'RENT' ? data.invoiceId : undefined,
          maintenanceInvoiceId:
            data.invoiceType === 'MAINTENANCE' ? data.invoiceId : undefined,
          feeAmount: data.lateFeeAmount,
          reason: data.reason || 'Late payment charge',
          status: 'ACTIVE',
          appliedAt: new Date(),
        },
      });

      // Update invoice with late fee
      if (data.invoiceType === 'RENT') {
        const currentLateFee = (invoice as any).lateFeeApplied || 0;
        await prisma.rentInvoice.update({
          where: { id: data.invoiceId },
          data: {
            lateFeeApplied: currentLateFee + data.lateFeeAmount,
            remainingAmount:
              (invoice as any).remainingAmount + data.lateFeeAmount,
          },
        });
      } else {
        const currentLateFee = (invoice as any).lateFeeApplied || 0;
        await prisma.maintenanceInvoice.update({
          where: { id: data.invoiceId },
          data: {
            lateFeeApplied: currentLateFee + data.lateFeeAmount,
            remainingAmount:
              (invoice as any).remainingAmount + data.lateFeeAmount,
          },
        });
      }

      return { success: true, data: lateFee };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply late fee',
      };
    }
  }

  /**
   * Waive late fee
   */
  async waiveLateFee(data: WaiveLateFeeDto) {
    try {
      const lateFee = await prisma.lateFee.findUnique({
        where: { id: data.lateFeeId },
      });

      if (!lateFee) {
        return { success: false, error: 'Late fee not found' };
      }

      if (lateFee.status === 'WAIVED') {
        return { success: false, error: 'Late fee already waived' };
      }

      // Update late fee status
      const updated = await prisma.lateFee.update({
        where: { id: data.lateFeeId },
        data: {
          status: 'WAIVED',
          waivedAt: new Date(),
          waivedBy: data.waivedBy,
          waiverReason: data.reason,
        },
      });

      // Reduce invoice remaining amount
      if (lateFee.rentInvoiceId) {
        const invoice = await prisma.rentInvoice.findUnique({
          where: { id: lateFee.rentInvoiceId },
        });
        if (invoice) {
          await prisma.rentInvoice.update({
            where: { id: lateFee.rentInvoiceId },
            data: {
              lateFeeApplied: Math.max(0, invoice.lateFeeApplied - lateFee.feeAmount),
              remainingAmount: Math.max(0, invoice.remainingAmount - lateFee.feeAmount),
            },
          });
        }
      } else if (lateFee.maintenanceInvoiceId) {
        const invoice = await prisma.maintenanceInvoice.findUnique({
          where: { id: lateFee.maintenanceInvoiceId },
        });
        if (invoice) {
          await prisma.maintenanceInvoice.update({
            where: { id: lateFee.maintenanceInvoiceId },
            data: {
              lateFeeApplied: Math.max(0, invoice.lateFeeApplied - lateFee.feeAmount),
              remainingAmount: Math.max(0, invoice.remainingAmount - lateFee.feeAmount),
            },
          });
        }
      }

      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to waive late fee',
      };
    }
  }

  /**
   * Get late fees for tenant
   */
  async getTenantLateFees(tenantId: string) {
    try {
      const lateFees = await prisma.lateFee.findMany({
        where: { tenantId },
        include: {
          rentInvoice: true,
          maintenanceInvoice: true,
        },
        orderBy: { appliedAt: 'desc' },
      });

      return { success: true, data: lateFees };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch late fees',
      };
    }
  }

  /**
   * Get late fee summary for property
   */
  async getPropertyLateFeesSummary(propertyId: string) {
    try {
      // Get all active late fees
      const rentInvoices = await prisma.rentInvoice.findMany({
        where: { propertyId, isOverdue: true },
        select: { id: true, lateFeeApplied: true },
      });

      const maintenanceInvoices = await prisma.maintenanceInvoice.findMany({
        where: { propertyId, isOverdue: true },
        select: { id: true, lateFeeApplied: true },
      });

      const allInvoiceIds = [
        ...rentInvoices.map((i) => i.id),
        ...maintenanceInvoices.map((i) => i.id),
      ];

      const lateFees = await prisma.lateFee.aggregate({
        where: {
          OR: [
            { rentInvoiceId: { in: rentInvoices.map((i) => i.id) } },
            { maintenanceInvoiceId: { in: maintenanceInvoices.map((i) => i.id) } },
          ],
          status: 'ACTIVE',
        },
        _sum: { feeAmount: true },
        _count: { id: true },
      });

      const waivedFees = await prisma.lateFee.aggregate({
        where: {
          OR: [
            { rentInvoiceId: { in: rentInvoices.map((i) => i.id) } },
            { maintenanceInvoiceId: { in: maintenanceInvoices.map((i) => i.id) } },
          ],
          status: 'WAIVED',
        },
        _sum: { feeAmount: true },
        _count: { id: true },
      });

      return {
        success: true,
        data: {
          activeLateFees: lateFees._count.id,
          activeLateFeesAmount: lateFees._sum.feeAmount || 0,
          waivedLateFees: waivedFees._count.id,
          waivedLateFeeAmount: waivedFees._sum.feeAmount || 0,
          totalOverdueInvoices:
            rentInvoices.length + maintenanceInvoices.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get late fees summary',
      };
    }
  }

  /**
   * Process pending late fees (called by scheduler)
   */
  async processPendingLateFees() {
    try {
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

      // Find overdue rent invoices without late fees
      const overdueRentInvoices = await prisma.rentInvoice.findMany({
        where: {
          dueDate: { lte: tenDaysAgo },
          isOverdue: true,
          lateFeeApplied: 0,
          status: {
            in: [
              'OVERDUE',
              'PARTIALLY_PAID',
            ],
          },
        },
      });

      let appliedCount = 0;

      for (const invoice of overdueRentInvoices) {
        const daysOverdue = Math.floor(
          (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        const feeCalculation = await this.calculateLateFee({
          invoiceId: invoice.id,
          invoiceType: 'RENT',
          daysOverdue,
        });

        if (feeCalculation.success) {
          const applyResult = await this.applyLateFee({
            invoiceId: invoice.id,
            invoiceType: 'RENT',
            lateFeeAmount: feeCalculation.data.lateFeeAmount,
            reason: `Late fee - ${daysOverdue} days overdue`,
          });

          if (applyResult.success) {
            appliedCount++;
          }
        }
      }

      // Same for maintenance invoices
      const overdueMaintenanceInvoices = await prisma.maintenanceInvoice.findMany({
        where: {
          dueDate: { lte: tenDaysAgo },
          isOverdue: true,
          lateFeeApplied: 0,
          status: {
            in: [
              'OVERDUE',
              'PARTIALLY_PAID',
            ],
          },
        },
      });

      for (const invoice of overdueMaintenanceInvoices) {
        const daysOverdue = Math.floor(
          (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        const feeCalculation = await this.calculateLateFee({
          invoiceId: invoice.id,
          invoiceType: 'MAINTENANCE',
          daysOverdue,
        });

        if (feeCalculation.success) {
          const applyResult = await this.applyLateFee({
            invoiceId: invoice.id,
            invoiceType: 'MAINTENANCE',
            lateFeeAmount: feeCalculation.data.lateFeeAmount,
            reason: `Late fee - ${daysOverdue} days overdue`,
          });

          if (applyResult.success) {
            appliedCount++;
          }
        }
      }

      return {
        success: true,
        data: {
          appliedCount,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process pending late fees',
      };
    }
  }
}

export default new LateFeeService();
