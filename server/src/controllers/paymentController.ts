import { Request, Response } from 'express';
import paymentService from '../services/paymentService';
import paymentReceiptService from '../services/paymentReceiptService';
import paymentGatewayService from '../services/paymentGatewayService';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class PaymentController {
  /**
   * Initiate payment
   */
  async initiatePayment(req: Request, res: Response) {
    try {
      const {
        tenantId,
        propertyId,
        apartmentId,
        rentInvoiceId,
        maintenanceInvoiceId,
        amount,
        paymentMethod,
        paymentGateway,
      } = req.body;

      if (
        !tenantId ||
        !propertyId ||
        !apartmentId ||
        !amount ||
        !paymentMethod
      ) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      // Process payment through gateway if needed
      let gatewayResponse = null;
      let transactionId = null;
      let gatewayReference = null;

      if (paymentGateway === 'RAZORPAY' || paymentGateway === 'STRIPE') {
        // Initiate payment through gateway
        if (paymentGateway === 'RAZORPAY') {
          const initResult = await paymentGatewayService.initiateRazorpayPayment({
            amount,
            currency: 'INR',
            description: `Payment for ${rentInvoiceId ? 'Rent' : 'Maintenance'} Invoice`,
            customerId: tenantId,
            customerEmail: 'tenant@example.com', // TODO: Get from user
            customerPhone: '+91XXXXXXXXXX', // TODO: Get from user
            metadata: {
              tenantId,
              propertyId,
              rentInvoiceId,
              maintenanceInvoiceId,
            },
          });

          if (initResult.success) {
            transactionId = initResult.data.orderId;
            gatewayReference = initResult.data.orderId;
            gatewayResponse = initResult;
          } else {
            return res.status(400).json(initResult);
          }
        } else if (paymentGateway === 'STRIPE') {
          const initResult = await paymentGatewayService.initiateStripePayment({
            amount,
            currency: 'USD',
            description: `Payment for ${rentInvoiceId ? 'Rent' : 'Maintenance'} Invoice`,
            customerId: tenantId,
            customerEmail: 'tenant@example.com',
            customerPhone: '+91XXXXXXXXXX',
            metadata: {
              tenantId,
              propertyId,
              rentInvoiceId,
              maintenanceInvoiceId,
            },
          });

          if (initResult.success) {
            transactionId = initResult.data.clientSecret;
            gatewayReference = initResult.data.clientSecret;
            gatewayResponse = initResult;
          } else {
            return res.status(400).json(initResult);
          }
        }
      }

      // Create payment record
      const result = await paymentService.processPayment({
        tenantId,
        propertyId,
        apartmentId,
        rentInvoiceId,
        maintenanceInvoiceId,
        amount,
        paymentMethod,
        paymentGateway: paymentGateway || 'MANUAL',
        transactionId,
        gatewayReference,
      });

      if (result.success) {
        return res.status(201).json({
          ...result,
          gatewayResponse,
        });
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate payment',
      });
    }
  }

  /**
   * Confirm payment (webhook from gateway)
   */
  async confirmPayment(req: Request, res: Response) {
    try {
      const { paymentId, verified, failureReason } = req.body;

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          error: 'Payment ID required',
        });
      }

      if (verified) {
        const result = await paymentService.confirmPayment(paymentId);

        if (result.success) {
          // Generate receipt
          const receiptResult = await paymentReceiptService.generateReceipt({
            paymentId,
          });

          return res.status(200).json({
            ...result,
            receipt: receiptResult.data,
          });
        } else {
          return res.status(400).json(result);
        }
      } else {
        const result = await paymentService.failPayment(paymentId, failureReason || 'Payment verification failed');
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm payment',
      });
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          error: 'Payment ID required',
        });
      }

      const result = await paymentService.getPaymentById(paymentId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment',
      });
    }
  }

  /**
   * List payments with filters
   */
  async listPayments(req: Request, res: Response) {
    try {
      const { tenantId, propertyId, status, paymentMethod, startDate, endDate, skip = 0, take = 20 } = req.query;

      const filters = {
        tenantId: tenantId as string,
        propertyId: propertyId as string,
        status: status as PaymentStatus,
        paymentMethod: paymentMethod as PaymentMethod,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const result = await paymentService.listPayments(filters, Number(skip), Number(take));

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list payments',
      });
    }
  }

  /**
   * Process refund
   */
  async refundPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { refundAmount, reason } = req.body;

      if (!paymentId || !refundAmount || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: paymentId, refundAmount, reason',
        });
      }

      const result = await paymentService.processRefund(paymentId, refundAmount, reason);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund',
      });
    }
  }

  /**
   * Get payment statistics
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const { propertyId, startDate, endDate } = req.query;

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          error: 'Property ID required',
        });
      }

      const result = await paymentService.getPaymentStatistics(
        propertyId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get statistics',
      });
    }
  }

  /**
   * Get tenant payment history
   */
  async getTenantHistory(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          error: 'Tenant ID required',
        });
      }

      const result = await paymentService.getTenantPaymentHistory(tenantId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history',
      });
    }
  }
}

export default new PaymentController();
