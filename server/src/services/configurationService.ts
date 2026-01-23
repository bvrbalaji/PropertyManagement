import prisma from '../config/database';

export interface CreateRentConfigDto {
  propertyId: string;
  apartmentId?: string;
  rentAmount: number;
  dueDate: number; // Day of month (1-31)
  gracePeriodDays?: number;
  lateFeeCalculationMethod?: 'FLAT' | 'PERCENT_PER_DAY' | 'PERCENT_PER_MONTH';
  lateFeeAmount?: number;
  lateFeePercent?: number;
  lateFeeMaxCap?: number;
  allowPartialPayments?: boolean;
  annualEscalationPercent?: number;
  nextEscalationDate?: Date;
}

export interface CreateMaintenanceFeeConfigDto {
  propertyId: string;
  apartmentId?: string;
  feeType?: 'FIXED' | 'VARIABLE';
  fixedAmount?: number;
  billingCycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  lateFeeCalculationMethod?: 'FLAT' | 'PERCENT_PER_DAY' | 'PERCENT_PER_MONTH';
  lateFeeAmount?: number;
  lateFeePercent?: number;
  lateFeeMaxCap?: number;
  excludeVacantUnits?: boolean;
  annualEscalationPercent?: number;
  nextEscalationDate?: Date;
}

export interface UpdateRentConfigDto {
  rentAmount?: number;
  dueDate?: number;
  gracePeriodDays?: number;
  lateFeeCalculationMethod?: 'FLAT' | 'PERCENT_PER_DAY' | 'PERCENT_PER_MONTH';
  lateFeeAmount?: number;
  lateFeePercent?: number;
  lateFeeMaxCap?: number;
  allowPartialPayments?: boolean;
  annualEscalationPercent?: number;
}

export interface UpdateMaintenanceFeeConfigDto {
  feeType?: 'FIXED' | 'VARIABLE';
  fixedAmount?: number;
  billingCycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  lateFeeCalculationMethod?: 'FLAT' | 'PERCENT_PER_DAY' | 'PERCENT_PER_MONTH';
  lateFeeAmount?: number;
  lateFeePercent?: number;
  lateFeeMaxCap?: number;
  excludeVacantUnits?: boolean;
  annualEscalationPercent?: number;
}

export class ConfigurationService {
  /**
   * Create rent configuration
   */
  async createRentConfig(data: CreateRentConfigDto) {
    try {
      // Validate property exists
      const property = await prisma.property.findUnique({
        where: { id: data.propertyId },
      });

      if (!property) {
        return { success: false, error: 'Property not found' };
      }

      // Validate apartment if provided
      if (data.apartmentId) {
        const apartment = await prisma.apartment.findUnique({
          where: { id: data.apartmentId },
        });

        if (!apartment || apartment.propertyId !== data.propertyId) {
          return { success: false, error: 'Apartment not found in this property' };
        }
      }

      // Check if config already exists
      const existing = await prisma.rentConfig.findFirst({
        where: {
          propertyId: data.propertyId,
          apartmentId: data.apartmentId || null,
        },
      });

      if (existing) {
        return { success: false, error: 'Configuration already exists for this property/apartment' };
      }

      const config = await prisma.rentConfig.create({
        data: {
          propertyId: data.propertyId,
          apartmentId: data.apartmentId,
          rentAmount: data.rentAmount,
          dueDate: Math.min(31, Math.max(1, data.dueDate)),
          gracePeriodDays: data.gracePeriodDays || 5,
          lateFeeCalculationMethod: data.lateFeeCalculationMethod || 'FLAT',
          lateFeeAmount: data.lateFeeAmount || 0,
          lateFeePercent: data.lateFeePercent || 0,
          lateFeeMaxCap: data.lateFeeMaxCap,
          allowPartialPayments: data.allowPartialPayments !== false,
          annualEscalationPercent: data.annualEscalationPercent || 0,
          nextEscalationDate: data.nextEscalationDate,
        },
        include: {
          property: true,
          apartment: true,
        },
      });

      return { success: true, data: config };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create rent config',
      };
    }
  }

  /**
   * Create maintenance fee configuration
   */
  async createMaintenanceFeeConfig(data: CreateMaintenanceFeeConfigDto) {
    try {
      // Validate property exists
      const property = await prisma.property.findUnique({
        where: { id: data.propertyId },
      });

      if (!property) {
        return { success: false, error: 'Property not found' };
      }

      // Validate apartment if provided
      if (data.apartmentId) {
        const apartment = await prisma.apartment.findUnique({
          where: { id: data.apartmentId },
        });

        if (!apartment || apartment.propertyId !== data.propertyId) {
          return { success: false, error: 'Apartment not found in this property' };
        }
      }

      // Check if config already exists
      const existing = await prisma.maintenanceFeeConfig.findFirst({
        where: {
          propertyId: data.propertyId,
          apartmentId: data.apartmentId || null,
        },
      });

      if (existing) {
        return { success: false, error: 'Configuration already exists' };
      }

      const config = await prisma.maintenanceFeeConfig.create({
        data: {
          propertyId: data.propertyId,
          apartmentId: data.apartmentId,
          feeType: data.feeType || 'FIXED',
          fixedAmount: data.fixedAmount || 0,
          billingCycle: data.billingCycle || 'MONTHLY',
          lateFeeCalculationMethod: data.lateFeeCalculationMethod || 'FLAT',
          lateFeeAmount: data.lateFeeAmount || 0,
          lateFeePercent: data.lateFeePercent || 0,
          lateFeeMaxCap: data.lateFeeMaxCap,
          excludeVacantUnits: data.excludeVacantUnits || false,
          annualEscalationPercent: data.annualEscalationPercent || 0,
          nextEscalationDate: data.nextEscalationDate,
        },
        include: {
          property: true,
          apartment: true,
        },
      });

      return { success: true, data: config };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create maintenance fee config',
      };
    }
  }

  /**
   * Get rent configuration
   */
  async getRentConfig(configId: string) {
    try {
      const config = await prisma.rentConfig.findUnique({
        where: { id: configId },
        include: {
          property: true,
          apartment: true,
        },
      });

      if (!config) {
        return { success: false, error: 'Configuration not found' };
      }

      return { success: true, data: config };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch configuration',
      };
    }
  }

  /**
   * Get maintenance fee configuration
   */
  async getMaintenanceFeeConfig(configId: string) {
    try {
      const config = await prisma.maintenanceFeeConfig.findUnique({
        where: { id: configId },
        include: {
          property: true,
          apartment: true,
        },
      });

      if (!config) {
        return { success: false, error: 'Configuration not found' };
      }

      return { success: true, data: config };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch configuration',
      };
    }
  }

  /**
   * List rent configurations for property
   */
  async listRentConfigs(propertyId: string) {
    try {
      const configs = await prisma.rentConfig.findMany({
        where: { propertyId },
        include: {
          apartment: true,
        },
      });

      return { success: true, data: configs };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch configurations',
      };
    }
  }

  /**
   * List maintenance fee configurations for property
   */
  async listMaintenanceFeeConfigs(propertyId: string) {
    try {
      const configs = await prisma.maintenanceFeeConfig.findMany({
        where: { propertyId },
        include: {
          apartment: true,
        },
      });

      return { success: true, data: configs };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch configurations',
      };
    }
  }

  /**
   * Update rent configuration
   */
  async updateRentConfig(configId: string, data: UpdateRentConfigDto) {
    try {
      const config = await prisma.rentConfig.update({
        where: { id: configId },
        data: {
          rentAmount: data.rentAmount,
          dueDate: data.dueDate ? Math.min(31, Math.max(1, data.dueDate)) : undefined,
          gracePeriodDays: data.gracePeriodDays,
          lateFeeCalculationMethod: data.lateFeeCalculationMethod,
          lateFeeAmount: data.lateFeeAmount,
          lateFeePercent: data.lateFeePercent,
          lateFeeMaxCap: data.lateFeeMaxCap,
          allowPartialPayments: data.allowPartialPayments,
          annualEscalationPercent: data.annualEscalationPercent,
        },
        include: {
          property: true,
          apartment: true,
        },
      });

      return { success: true, data: config };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update configuration',
      };
    }
  }

  /**
   * Update maintenance fee configuration
   */
  async updateMaintenanceFeeConfig(configId: string, data: UpdateMaintenanceFeeConfigDto) {
    try {
      const config = await prisma.maintenanceFeeConfig.update({
        where: { id: configId },
        data: {
          feeType: data.feeType,
          fixedAmount: data.fixedAmount,
          billingCycle: data.billingCycle,
          lateFeeCalculationMethod: data.lateFeeCalculationMethod,
          lateFeeAmount: data.lateFeeAmount,
          lateFeePercent: data.lateFeePercent,
          lateFeeMaxCap: data.lateFeeMaxCap,
          excludeVacantUnits: data.excludeVacantUnits,
          annualEscalationPercent: data.annualEscalationPercent,
        },
        include: {
          property: true,
          apartment: true,
        },
      });

      return { success: true, data: config };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update configuration',
      };
    }
  }

  /**
   * Delete rent configuration
   */
  async deleteRentConfig(configId: string) {
    try {
      await prisma.rentConfig.delete({
        where: { id: configId },
      });

      return { success: true, message: 'Configuration deleted' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete configuration',
      };
    }
  }

  /**
   * Delete maintenance fee configuration
   */
  async deleteMaintenanceFeeConfig(configId: string) {
    try {
      await prisma.maintenanceFeeConfig.delete({
        where: { id: configId },
      });

      return { success: true, message: 'Configuration deleted' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete configuration',
      };
    }
  }

  /**
   * Process annual rent escalation
   */
  async processAnnualRentEscalation() {
    try {
      const configs = await prisma.rentConfig.findMany({
        where: {
          annualEscalationPercent: { gt: 0 },
          nextEscalationDate: { lte: new Date() },
        },
      });

      let processedCount = 0;

      for (const config of configs) {
        const escalationAmount =
          config.rentAmount * (config.annualEscalationPercent / 100);
        const newRentAmount = config.rentAmount + escalationAmount;

        await prisma.rentConfig.update({
          where: { id: config.id },
          data: {
            rentAmount: newRentAmount,
            nextEscalationDate: new Date(
              new Date().getFullYear() + 1,
              new Date().getMonth(),
              new Date().getDate(),
            ),
          },
        });

        processedCount++;
      }

      return {
        success: true,
        data: { processedCount, timestamp: new Date() },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process escalation',
      };
    }
  }

  /**
   * Process annual maintenance fee escalation
   */
  async processAnnualMaintenanceFeeEscalation() {
    try {
      const configs = await prisma.maintenanceFeeConfig.findMany({
        where: {
          annualEscalationPercent: { gt: 0 },
          nextEscalationDate: { lte: new Date() },
        },
      });

      let processedCount = 0;

      for (const config of configs) {
        if (config.fixedAmount) {
          const escalationAmount =
            config.fixedAmount * (config.annualEscalationPercent / 100);
          const newFixedAmount = config.fixedAmount + escalationAmount;

          await prisma.maintenanceFeeConfig.update({
            where: { id: config.id },
            data: {
              fixedAmount: newFixedAmount,
              nextEscalationDate: new Date(
                new Date().getFullYear() + 1,
                new Date().getMonth(),
                new Date().getDate(),
              ),
            },
          });

          processedCount++;
        }
      }

      return {
        success: true,
        data: { processedCount, timestamp: new Date() },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process escalation',
      };
    }
  }
}

export default new ConfigurationService();
