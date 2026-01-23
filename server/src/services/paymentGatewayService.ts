import axios from 'axios';

export interface PaymentInitiationData {
  amount: number;
  currency?: string;
  description: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  metadata: Record<string, any>;
}

export class PaymentGatewayService {
  private razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
  private razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
  private stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

  /**
   * Initiate payment via Razorpay
   */
  async initiateRazorpayPayment(data: PaymentInitiationData) {
    try {
      if (!this.razorpayKeyId || !this.razorpayKeySecret) {
        throw new Error('Razorpay credentials not configured');
      }

      const response = await axios.post(
        'https://api.razorpay.com/v1/orders',
        {
          amount: Math.round(data.amount * 100), // Convert to paise
          currency: data.currency || 'INR',
          receipt: `receipt_${data.metadata.onboardingId}`,
          notes: data.metadata,
        },
        {
          auth: {
            username: this.razorpayKeyId,
            password: this.razorpayKeySecret,
          },
        },
      );

      return {
        success: true,
        gateway: 'RAZORPAY',
        data: {
          orderId: response.data.id,
          amount: data.amount,
          currency: data.currency || 'INR',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initiate Razorpay payment',
      };
    }
  }

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpayPayment(
    orderId: string,
    paymentId: string,
    signature: string,
  ) {
    try {
      const crypto = require('crypto');

      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpayKeySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === signature) {
        return {
          success: true,
          verified: true,
          paymentId,
          orderId,
        };
      } else {
        throw new Error('Payment signature verification failed');
      }
    } catch (error) {
      return {
        success: false,
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : 'Payment verification failed',
      };
    }
  }

  /**
   * Initiate payment via Stripe
   */
  async initiateStripePayment(data: PaymentInitiationData) {
    try {
      if (!this.stripeSecretKey) {
        throw new Error('Stripe credentials not configured');
      }

      // This would use the Stripe SDK in actual implementation
      // For now, returning mock response
      return {
        success: true,
        gateway: 'STRIPE',
        data: {
          clientSecret: `pi_${Math.random().toString(36).substr(2, 9)}`,
          amount: data.amount,
          currency: data.currency || 'USD',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initiate Stripe payment',
      };
    }
  }

  /**
   * Verify Stripe payment
   */
  async verifyStripePayment(paymentIntentId: string) {
    try {
      // This would use the Stripe SDK in actual implementation
      return {
        success: true,
        verified: true,
        paymentId: paymentIntentId,
      };
    } catch (error) {
      return {
        success: false,
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : 'Payment verification failed',
      };
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    paymentGateway: string,
    paymentId: string,
    amount: number,
  ) {
    try {
      if (paymentGateway === 'RAZORPAY') {
        return await this.processRazorpayRefund(paymentId, amount);
      } else if (paymentGateway === 'STRIPE') {
        return await this.processStripeRefund(paymentId, amount);
      } else {
        throw new Error('Unknown payment gateway');
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Refund processing failed',
      };
    }
  }

  /**
   * Process Razorpay refund
   */
  private async processRazorpayRefund(paymentId: string, amount: number) {
    try {
      const response = await axios.post(
        `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
        {
          amount: Math.round(amount * 100), // Convert to paise
        },
        {
          auth: {
            username: this.razorpayKeyId,
            password: this.razorpayKeySecret,
          },
        },
      );

      return {
        success: true,
        data: {
          refundId: response.data.id,
          amount: amount,
          status: response.data.status,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process Stripe refund
   */
  private async processStripeRefund(paymentId: string, amount: number) {
    try {
      // This would use the Stripe SDK in actual implementation
      return {
        success: true,
        data: {
          refundId: `re_${Math.random().toString(36).substr(2, 9)}`,
          amount: amount,
          status: 'succeeded',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentGateway: string, paymentId: string) {
    try {
      if (paymentGateway === 'RAZORPAY') {
        const response = await axios.get(
          `https://api.razorpay.com/v1/payments/${paymentId}`,
          {
            auth: {
              username: this.razorpayKeyId,
              password: this.razorpayKeySecret,
            },
          },
        );

        return {
          success: true,
          data: {
            paymentId: response.data.id,
            status: response.data.status,
            amount: response.data.amount / 100, // Convert from paise
            currency: response.data.currency,
          },
        };
      }

      throw new Error('Payment gateway not supported');
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get payment status',
      };
    }
  }
}

export default new PaymentGatewayService();
