import { Request, Response } from 'express';
import offboardingService from '../services/offboardingService';
import parkingService from '../services/parkingService';
import paymentGatewayService from '../services/paymentGatewayService';

export class OffboardingController {
  /**
   * Create offboarding request
   */
  async createOffboardingRequest(req: Request, res: Response) {
    try {
      const { tenantId, apartmentId, propertyId, onboardingId, moveOutDate } =
        req.body;

      // Validate required fields
      if (!tenantId || !apartmentId || !propertyId || !onboardingId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      const result = await offboardingService.createOffboardingRequest({
        tenantId,
        apartmentId,
        propertyId,
        onboardingId,
        moveOutDate: new Date(moveOutDate),
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
   * Schedule move-out inspection
   */
  async scheduleInspection(req: Request, res: Response) {
    try {
      const { offboardingId } = req.params;
      const { checklistId, inspectionDate } = req.body;

      const result = await offboardingService.scheduleInspection(
        offboardingId,
        checklistId,
        new Date(inspectionDate),
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
   * Record move-out inspection with before/after comparison
   */
  async recordMoveOutInspection(req: Request, res: Response) {
    try {
      const { offboardingId } = req.params;
      const inspectionData = req.body;

      const result = await offboardingService.recordMoveOutInspection(
        offboardingId,
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
   * Calculate final settlement
   */
  async calculateFinalSettlement(req: Request, res: Response) {
    try {
      const { offboardingId } = req.params;
      const damageAssessmentData = req.body;

      const result = await offboardingService.calculateFinalSettlement(
        offboardingId,
        damageAssessmentData,
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
   * Process refund
   * COMMENTED OUT - Payment process to be enabled later
   */
  // async processRefund(req: Request, res: Response) {
  //   try {
  //     const { offboardingId } = req.params;
  //     const { paymentGateway, refundDetails } = req.body;
  //
  //     const result = await offboardingService.processRefund(
  //       offboardingId,
  //       paymentGateway,
  //       refundDetails,
  //     );
  //
  //     if (!result.success) {
  //       return res.status(400).json(result);
  //     }
  //
  //     return res.status(200).json(result);
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       error: error instanceof Error ? error.message : 'Internal server error',
  //     });
  //   }
  // }

  /**
   * Issue clearance certificate
   */
  async issueClearanceCertificate(req: Request, res: Response) {
    try {
      const { offboardingId } = req.params;
      const { certificateUrl } = req.body;

      const result = await offboardingService.issueClearanceCertificate(
        offboardingId,
        certificateUrl,
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
   * Complete offboarding
   */
  async completeOffboarding(req: Request, res: Response) {
    try {
      const { offboardingId } = req.params;

      const result = await offboardingService.completeOffboarding(
        offboardingId,
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
   * Get offboarding details
   */
  async getOffboarding(req: Request, res: Response) {
    try {
      const { offboardingId } = req.params;

      const result = await offboardingService.getOffboardingDetails(
        offboardingId,
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
   * Get tenant's offboardings
   */
  async getTenantOffboardings(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;

      const result = await offboardingService.getTenantOffboardings(tenantId);

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
   * Get property offboardings
   */
  async getPropertyOffboardings(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { status } = req.query;

      const result = await offboardingService.getPropertyOffboardings(
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
   * Cancel offboarding request
   */
  async cancelOffboarding(req: Request, res: Response) {
    try {
      const { offboardingId } = req.params;

      const result = await offboardingService.cancelOffboarding(offboardingId);

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

export default new OffboardingController();
