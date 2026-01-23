import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { PaymentStatus, PaymentMethod, InvoiceStatus } from '@prisma/client';
import paymentGatewayService from './paymentGatewayService';

export interface ProcessPaymentDto {
  tenantId: string;
  propertyId: string;
  apartmentId: string;
  rentInvoiceId?: string;
  maintenanceInvoiceId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentGateway?: string;
  transactionId?: string;
  gatewayReference?: string;
}

export interface PaymentFilters {
  tenantId?: string;
  propertyId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
}

export class PaymentService {
  /**
   * Process payment
   */
  async processPayment(data: ProcessPaymentDto) {
    try {
      // Validate invoice exists and get details
      let invoice = null;
      let totalDue = 0;

      if (data.rentInvoiceId) {
        invoice = await prisma.rentInvoice.findUnique({
          where: { id: data.rentInvoiceId },
        });
        if (!invoice) {
          return { success: false, error: 'Rent invoice not found' };
        }
        totalDue = invoice.remainingAmount;
      } else if (data.maintenanceInvoiceId) {
        invoice = await prisma.maintenanceInvoice.findUnique({
          where: { id: data.maintenanceInvoiceId },
        });
        if (!invoice) {
          return { success: false, error: 'Maintenance invoice not found' };
        }
        totalDue = invoice.remainingAmount;
      } else {
        return { success: false, error: 'Invoice ID required' };
      }

      // Validate payment amount
      if (data.amount <= 0 || data.amount > totalDue + 1000) {
        return { success: false, error: 'Invalid payment amount' };
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          tenantId: data.tenantId,
          propertyId: data.propertyId,
          apartmentId: data.apartmentId,
          rentInvoiceId: data.rentInvoiceId,
          maintenanceInvoiceId: data.maintenanceInvoiceId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          paymentGateway: data.paymentGateway || 'MANUAL',
          transactionId: data.transactionId,
          gatewayReference: data.gatewayReference,
          status: PaymentStatus.PENDING,
          gatewayResponse: {},
        },
        include: {
          tenant: true,
          rentInvoice: true,
          maintenanceInvoice: true,
        },
      });

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process payment',
      };
    }
  }

  /**
   * Confirm payment (after gateway verification)
   */
  async confirmPayment(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          rentInvoice: true,
          maintenanceInvoice: true,
        },
      });

      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      if (payment.status !== PaymentStatus.PENDING) {
        return { success: false, error: 'Payment already processed' };
      }

      // Update payment status to SUCCESS
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCESS,
          successDate: new Date(),
        },
      });

      // Update invoice
      let invoiceData = {};
      if (payment.rentInvoiceId && payment.rentInvoice) {
        const newPaidAmount = payment.rentInvoice.paidAmount + payment.amount;
        const remainingAmount = payment.rentInvoice.rentAmount - newPaidAmount;

        const status =
          remainingAmount <= 0
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIALLY_PAID;

        invoiceData = {
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, remainingAmount),
          status,
        };

        await prisma.rentInvoice.update({
          where: { id: payment.rentInvoiceId },
          data: invoiceData,
        });
      } else if (payment.maintenanceInvoiceId && payment.maintenanceInvoice) {
        const newPaidAmount = payment.maintenanceInvoice.paidAmount + payment.amount;
        const remainingAmount = payment.maintenanceInvoice.totalAmount - newPaidAmount;

        const status =
          remainingAmount <= 0
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIALLY_PAID;

        invoiceData = {
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, remainingAmount),
          status,
        };

        await prisma.maintenanceInvoice.update({
          where: { id: payment.maintenanceInvoiceId },
          data: invoiceData,
        });
      }

      return { success: true, data: updatedPayment };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm payment',
      };
    }
  }

  /**
   * Failed payment
   */
  async failPayment(paymentId: string, failureReason: string) {
    try {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          failureReason,
          failedDate: new Date(),
        },
      });

      return { success: true, data: payment };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update payment',
      };
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId: string, refundAmount: number, reason: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      if (payment.status !== PaymentStatus.SUCCESS) {
        return { success: false, error: 'Only successful payments can be refunded' };
      }

      if (refundAmount > payment.amount) {
        return { success: false, error: 'Refund amount cannot exceed payment amount' };
      }

      // Process refund through gateway if applicable
      let refundResult = { success: true, data: {} };
      if (payment.paymentGateway && payment.gatewayReference) {
        refundResult = await paymentGatewayService.processRefund(
          payment.paymentGateway,
          payment.gatewayReference,
          refundAmount,
        );
      }

      if (!refundResult.success) {
        return { success: false, error: 'Failed to process refund through gateway' };
      }

      // Update payment record
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: refundAmount === payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PENDING,
          refundAmount,
          refundReason: reason,
          refundedDate: new Date(),
        },
      });

      return { success: true, data: updatedPayment };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund',
      };
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          tenant: true,
          rentInvoice: true,
          maintenanceInvoice: true,
          receipt: true,
        },
      });

      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      return { success: true, data: payment };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment',
      };
    }
  }

  /**
   * List payments with filters
   */
  async listPayments(filters: PaymentFilters = {}, skip = 0, take = 20) {
    try {
      const where: Prisma.PaymentWhereInput = {};

      if (filters.tenantId) where.tenantId = filters.tenantId;
      if (filters.propertyId) where.propertyId = filters.propertyId;
      if (filters.status) where.status = filters.status;
      if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          include: {
            tenant: true,
            rentInvoice: true,
            maintenanceInvoice: true,
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where }),
      ]);

      return {
        success: true,
        data: {
          payments,
          total,
          page: Math.floor(skip / take) + 1,
          pages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list payments',
      };
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(propertyId: string, startDate?: Date, endDate?: Date) {
    try {
      const where: Prisma.PaymentWhereInput = { propertyId };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const stats = await prisma.payment.aggregate({
        where,
        _sum: {
          amount: true,
          refundAmount: true,
        },
        _count: {
          id: true,
        },
      });

      const byStatus = await prisma.payment.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      });

      const byMethod = await prisma.payment.groupBy({
        by: ['paymentMethod'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      });

      return {
        success: true,
        data: {
          totalTransactions: stats._count.id,
          totalAmount: stats._sum.amount || 0,
          totalRefunds: stats._sum.refundAmount || 0,
          byStatus,
          byMethod,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get statistics',
      };
    }
  }

  /**
   * Get payment history for tenant
   */
  async getTenantPaymentHistory(tenantId: string) {
    try {
      const payments = await prisma.payment.findMany({
        where: { tenantId },
        include: {
          rentInvoice: true,
          maintenanceInvoice: true,
          receipt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, data: payments };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment history',
      };
    }
  }
}

export default new PaymentService();
