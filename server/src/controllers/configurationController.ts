import { Request, Response } from 'express';
import configurationService from '../services/configurationService';

export class ConfigurationController {
  /**
   * Create rent configuration
   */
  async createRentConfig(req: Request, res: Response) {
    try {
      const {
        propertyId,
        apartmentId,
        rentAmount,
        dueDate,
        gracePeriodDays,
        lateFeeCalculationMethod,
        lateFeeAmount,
        lateFeePercent,
        lateFeeMaxCap,
        allowPartialPayments,
        annualEscalationPercent,
        nextEscalationDate,
      } = req.body;

      if (!propertyId || !rentAmount || dueDate === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: propertyId, rentAmount, dueDate',
        });
      }

      const result = await configurationService.createRentConfig({
        propertyId,
        apartmentId,
        rentAmount,
        dueDate,
        gracePeriodDays,
        lateFeeCalculationMethod,
        lateFeeAmount,
        lateFeePercent,
        lateFeeMaxCap,
        allowPartialPayments,
        annualEscalationPercent,
        nextEscalationDate: nextEscalationDate ? new Date(nextEscalationDate) : undefined,
      });

      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create rent config',
      });
    }
  }

  /**
   * Create maintenance fee configuration
   */
  async createMaintenanceFeeConfig(req: Request, res: Response) {
    try {
      const {
        propertyId,
        apartmentId,
        feeType,
        fixedAmount,
        billingCycle,
        lateFeeCalculationMethod,
        lateFeeAmount,
        lateFeePercent,
        lateFeeMaxCap,
        excludeVacantUnits,
        annualEscalationPercent,
        nextEscalationDate,
      } = req.body;

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          error: 'Property ID required',
        });
      }

      const result = await configurationService.createMaintenanceFeeConfig({
        propertyId,
        apartmentId,
        feeType,
        fixedAmount,
        billingCycle,
        lateFeeCalculationMethod,
        lateFeeAmount,
        lateFeePercent,
        lateFeeMaxCap,
        excludeVacantUnits,
        annualEscalationPercent,
        nextEscalationDate: nextEscalationDate ? new Date(nextEscalationDate) : undefined,
      });

      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create maintenance fee config',
      });
    }
  }

  /**
   * Get rent configuration
   */
  async getRentConfig(req: Request, res: Response) {
    try {
      const { configId } = req.params;

      if (!configId) {
        return res.status(400).json({
          success: false,
          error: 'Configuration ID required',
        });
      }

      const result = await configurationService.getRentConfig(configId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch configuration',
      });
    }
  }

  /**
   * Get maintenance fee configuration
   */
  async getMaintenanceFeeConfig(req: Request, res: Response) {
    try {
      const { configId } = req.params;

      if (!configId) {
        return res.status(400).json({
          success: false,
          error: 'Configuration ID required',
        });
      }

      const result = await configurationService.getMaintenanceFeeConfig(configId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch configuration',
      });
    }
  }

  /**
   * List rent configurations
   */
  async listRentConfigs(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          error: 'Property ID required',
        });
      }

      const result = await configurationService.listRentConfigs(propertyId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list configurations',
      });
    }
  }

  /**
   * List maintenance fee configurations
   */
  async listMaintenanceFeeConfigs(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          error: 'Property ID required',
        });
      }

      const result = await configurationService.listMaintenanceFeeConfigs(propertyId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list configurations',
      });
    }
  }

  /**
   * Update rent configuration
   */
  async updateRentConfig(req: Request, res: Response) {
    try {
      const { configId } = req.params;
      const {
        rentAmount,
        dueDate,
        gracePeriodDays,
        lateFeeCalculationMethod,
        lateFeeAmount,
        lateFeePercent,
        lateFeeMaxCap,
        allowPartialPayments,
        annualEscalationPercent,
      } = req.body;

      if (!configId) {
        return res.status(400).json({
          success: false,
          error: 'Configuration ID required',
        });
      }

      const result = await configurationService.updateRentConfig(configId, {
        rentAmount,
        dueDate,
        gracePeriodDays,
        lateFeeCalculationMethod,
        lateFeeAmount,
        lateFeePercent,
        lateFeeMaxCap,
        allowPartialPayments,
        annualEscalationPercent,
      });

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update configuration',
      });
    }
  }

  /**
   * Update maintenance fee configuration
   */
  async updateMaintenanceFeeConfig(req: Request, res: Response) {
    try {
      const { configId } = req.params;
      const {
        feeType,
        fixedAmount,
        billingCycle,
        lateFeeCalculationMethod,
        lateFeeAmount,
        lateFeePercent,
        lateFeeMaxCap,
        excludeVacantUnits,
        annualEscalationPercent,
      } = req.body;

      if (!configId) {
        return res.status(400).json({
          success: false,
          error: 'Configuration ID required',
        });
      }

      const result = await configurationService.updateMaintenanceFeeConfig(configId, {
        feeType,
        fixedAmount,
        billingCycle,
        lateFeeCalculationMethod,
        lateFeeAmount,
        lateFeePercent,
        lateFeeMaxCap,
        excludeVacantUnits,
        annualEscalationPercent,
      });

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update configuration',
      });
    }
  }

  /**
   * Delete rent configuration
   */
  async deleteRentConfig(req: Request, res: Response) {
    try {
      const { configId } = req.params;

      if (!configId) {
        return res.status(400).json({
          success: false,
          error: 'Configuration ID required',
        });
      }

      const result = await configurationService.deleteRentConfig(configId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete configuration',
      });
    }
  }

  /**
   * Delete maintenance fee configuration
   */
  async deleteMaintenanceFeeConfig(req: Request, res: Response) {
    try {
      const { configId } = req.params;

      if (!configId) {
        return res.status(400).json({
          success: false,
          error: 'Configuration ID required',
        });
      }

      const result = await configurationService.deleteMaintenanceFeeConfig(configId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete configuration',
      });
    }
  }
}

export default new ConfigurationController();
