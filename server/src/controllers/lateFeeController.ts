import { Request, Response } from 'express';
import lateFeeService from '../services/lateFeeService';

export class LateFeeController {
  /**
   * Calculate late fee
   */
  async calculateLateFee(req: Request, res: Response) {
    try {
      const { invoiceId, invoiceType, daysOverdue } = req.body;

      if (!invoiceId || !invoiceType || daysOverdue === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: invoiceId, invoiceType, daysOverdue',
        });
      }

      const result = await lateFeeService.calculateLateFee({
        invoiceId,
        invoiceType,
        daysOverdue,
      });

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate late fee',
      });
    }
  }

  /**
   * Apply late fee
   */
  async applyLateFee(req: Request, res: Response) {
    try {
      const { invoiceId, invoiceType, lateFeeAmount, reason } = req.body;

      if (!invoiceId || !invoiceType || !lateFeeAmount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      const result = await lateFeeService.applyLateFee({
        invoiceId,
        invoiceType,
        lateFeeAmount,
        reason,
      });

      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply late fee',
      });
    }
  }

  /**
   * Waive late fee
   */
  async waiveLateFee(req: Request, res: Response) {
    try {
      const { lateFeeId } = req.params;
      const { reason, waivedBy } = req.body;

      if (!lateFeeId || !reason || !waivedBy) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      const result = await lateFeeService.waiveLateFee({
        lateFeeId,
        reason,
        waivedBy,
      });

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to waive late fee',
      });
    }
  }

  /**
   * Get tenant late fees
   */
  async getTenantLateFees(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          error: 'Tenant ID required',
        });
      }

      const result = await lateFeeService.getTenantLateFees(tenantId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch late fees',
      });
    }
  }

  /**
   * Get property late fees summary
   */
  async getPropertySummary(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          error: 'Property ID required',
        });
      }

      const result = await lateFeeService.getPropertyLateFeesSummary(propertyId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get summary',
      });
    }
  }
}

export default new LateFeeController();
