import { Request, Response } from 'express';
import onboardingService from '../services/onboardingService';
import parkingService from '../services/parkingService';
import paymentGatewayService from '../services/paymentGatewayService';

export class OnboardingController {
  /**
   * Create onboarding inquiry
   */
  async createOnboarding(req: Request, res: Response) {
    try {
      const {
        tenantId,
        apartmentId,
        propertyId,
        moveInDate,
        securityDeposit,
        vehicleType,
      } = req.body;

      // Validate required fields
      if (!tenantId || !apartmentId || !propertyId || !moveInDate) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      const result = await onboardingService.createOnboarding({
        tenantId,
        apartmentId,
        propertyId,
        moveInDate: new Date(moveInDate),
        securityDeposit,
        vehicleType,
        contactPhone: '',
        emergencyContact: '',
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Upload lease agreement
   */
  async uploadLeaseAgreement(req: Request, res: Response) {
    try {
      const { onboardingId } = req.params;
      const { fileUrl, fileName } = req.body;

      const result = await onboardingService.uploadLeaseAgreement(
        onboardingId,
        fileUrl,
        fileName,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Upload vehicle registration
   */
  async uploadVehicleRegistration(req: Request, res: Response) {
    try {
      const { onboardingId } = req.params;
      const { fileUrl, fileName } = req.body;

      const result = await onboardingService.uploadVehicleRegistration(
        onboardingId,
        fileUrl,
        fileName,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Sign lease agreement
   */
  async signLeaseAgreement(req: Request, res: Response) {
    try {
      const { onboardingId } = req.params;
      const { signature } = req.body;

      if (!signature) {
        return res.status(400).json({
          success: false,
          error: 'Signature is required',
        });
      }

      const result = await onboardingService.signLeaseAgreement(
        onboardingId,
        signature,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Initiate security deposit payment
   */
  async initiateSecurityDepositPayment(req: Request, res: Response) {
    try {
      const { onboardingId } = req.params;
      const { amount, customerEmail, customerPhone, paymentGateway } =
        req.body;

      const onboarding = await onboardingService.getOnboardingDetails(
        onboardingId,
      );

      if (!onboarding.success) {
        return res.status(400).json(onboarding);
      }

      const paymentResult = await paymentGatewayService.initiateRazorpayPayment(
        {
          amount,
          currency: 'INR',
          description: `Security Deposit - Onboarding ${onboardingId}`,
          customerId: onboarding.data.tenantId,
          customerEmail,
          customerPhone,
          metadata: {
            onboardingId,
            type: 'SECURITY_DEPOSIT',
          },
        },
      );

      if (!paymentResult.success) {
        return res.status(400).json(paymentResult);
      }

      return res.status(200).json(paymentResult);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Verify security deposit payment
   */
  async verifySecurityDepositPayment(req: Request, res: Response) {
    try {
      const { onboardingId } = req.params;
      const { orderId, paymentId, signature, amount } = req.body;

      // Verify payment
      const verifyResult = await paymentGatewayService.verifyRazorpayPayment(
        orderId,
        paymentId,
        signature,
      );

      if (!verifyResult.success || !verifyResult.verified) {
        return res.status(400).json({
          success: false,
          error: 'Payment verification failed',
        });
      }

      // Record payment
      const depositResult = await onboardingService.recordSecurityDeposit(
        onboardingId,
        amount,
        'RAZORPAY',
        paymentId,
        orderId,
      );

      if (!depositResult.success) {
        return res.status(400).json(depositResult);
      }

      return res.status(200).json(depositResult);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Assign parking slot
   */
  async assignParkingSlot(req: Request, res: Response) {
    try {
      const { onboardingId } = req.params;
      const { vehicleType } = req.body;

      const result = await parkingService.assignParkingSlot(
        onboardingId,
        vehicleType,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get onboarding details
   */
  async getOnboarding(req: Request, res: Response) {
    try {
      const { onboardingId } = req.params;

      const result = await onboardingService.getOnboardingDetails(
        onboardingId,
      );

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get tenant's onboardings
   */
  async getTenantOnboardings(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;

      const result = await onboardingService.getTenantOnboardings(tenantId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get property onboardings
   */
  async getPropertyOnboardings(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { status } = req.query;

      const result = await onboardingService.getPropertyOnboardings(
        propertyId,
        status as any,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Create inspection checklist
   */
  async createInspectionChecklist(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { name, items, isForOnboarding } = req.body;

      const result = await onboardingService.createInspectionChecklist(
        propertyId,
        name,
        items,
        isForOnboarding,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get inspection checklists
   */
  async getInspectionChecklists(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { isForOnboarding } = req.query;

      const result = await onboardingService.getInspectionChecklists(
        propertyId,
        isForOnboarding === 'true' ? true : isForOnboarding === 'false' ? false : undefined,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Create move-in inspection
   */
  async createMoveInInspection(req: Request, res: Response) {
    try {
      const { onboardingId } = req.params;
      const { checklistId, inspectionData } = req.body;

      const result = await onboardingService.createInspection(
        onboardingId,
        checklistId,
        inspectionData,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(req: Request, res: Response) {
    try {
      const { onboardingId } = req.params;

      const result = await onboardingService.completeOnboarding(onboardingId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}

export default new OnboardingController();
