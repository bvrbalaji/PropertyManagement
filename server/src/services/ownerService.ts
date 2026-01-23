import { PrismaClient } from '@prisma/client';
import { OwnershipVerificationStatus, CommunicationPreference } from '@prisma/client';

const prisma = new PrismaClient();

export class OwnerService {
  /**
   * Create owner profile for a user
   */
  async createOwnerProfile(userId: string, data: any) {
    try {
      const ownerProfile = await prisma.ownerProfile.create({
        data: {
          userId,
          secondaryEmail: data.secondaryEmail,
          secondaryPhone: data.secondaryPhone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          businessName: data.businessName,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          emergencyContactEmail: data.emergencyContactEmail,
          communicationPreference: data.communicationPreference || 'EMAIL',
          profileCompleteness: calculateProfileCompleteness(data),
        },
        include: {
          user: true,
          properties: {
            include: {
              property: true,
            },
          },
        },
      });

      return {
        success: true,
        data: ownerProfile,
        message: 'Owner profile created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get owner profile by user ID
   */
  async getOwnerProfile(userId: string) {
    try {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { userId },
        include: {
          user: true,
          properties: {
            include: {
              property: {
                include: {
                  apartments: true,
                },
              },
            },
          },
          verificationDocuments: true,
          coOwners: {
            include: {
              coOwnerProfile: {
                include: {
                  user: true,
                },
              },
            },
          },
          transfers: {
            include: {
              initiatedByUser: true,
              transferredToUser: true,
            },
          },
        },
      });

      if (!ownerProfile) {
        return {
          success: false,
          error: 'Owner profile not found',
        };
      }

      return {
        success: true,
        data: ownerProfile,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update owner profile
   */
  async updateOwnerProfile(userId: string, data: any) {
    try {
      const ownerProfile = await prisma.ownerProfile.update({
        where: { userId },
        data: {
          secondaryEmail: data.secondaryEmail,
          secondaryPhone: data.secondaryPhone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          businessName: data.businessName,
          panNumber: data.panNumber,
          gstin: data.gstin,
          bankAccountNumber: data.bankAccountNumber,
          bankIfscCode: data.bankIfscCode,
          bankAccountName: data.bankAccountName,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          emergencyContactEmail: data.emergencyContactEmail,
          communicationPreference: data.communicationPreference,
          profileCompleteness: calculateProfileCompleteness(data),
        },
        include: {
          user: true,
          properties: {
            include: {
              property: true,
            },
          },
        },
      });

      // Update User contact info
      await prisma.user.update({
        where: { id: userId },
        data: {
          fullName: data.fullName || undefined,
        },
      });

      return {
        success: true,
        data: ownerProfile,
        message: 'Owner profile updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Add property to owner
   */
  async addPropertyToOwner(ownerUserId: string, propertyId: string, ownershipPercentage: number = 100) {
    try {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { userId: ownerUserId },
      });

      if (!ownerProfile) {
        throw new Error('Owner profile not found');
      }

      const ownerProperty = await prisma.ownerProperty.create({
        data: {
          ownerProfileId: ownerProfile.id,
          propertyId,
          ownershipPercentage,
          ownershipStartDate: new Date(),
          isActive: true,
        },
        include: {
          property: true,
          ownerProfile: true,
        },
      });

      return {
        success: true,
        data: ownerProperty,
        message: 'Property added to owner successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all properties for an owner (Dashboard)
   */
  async getOwnerProperties(userId: string) {
    try {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { userId },
      });

      if (!ownerProfile) {
        return {
          success: false,
          error: 'Owner profile not found',
        };
      }

      const properties = await prisma.ownerProperty.findMany({
        where: { ownerProfileId: ownerProfile.id },
        include: {
          property: {
            include: {
              apartments: true,
              financialData: {
                where: {
                  ownerProfileId: ownerProfile.id,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: properties,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get financial summary for all properties
   */
  async getFinancialSummary(userId: string) {
    try {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { userId },
      });

      if (!ownerProfile) {
        return {
          success: false,
          error: 'Owner profile not found',
        };
      }

      const financialData = await prisma.ownerPropertyFinancial.findMany({
        where: { ownerProfileId: ownerProfile.id },
        include: {
          property: true,
        },
      });

      const summary = {
        totalProperties: financialData.length,
        totalRentalIncome: financialData.reduce((sum, f) => sum + f.rentalIncome, 0),
        totalMaintenanceFees: financialData.reduce((sum, f) => sum + f.maintenanceFees, 0),
        totalPropertyTax: financialData.reduce((sum, f) => sum + f.propertyTax, 0),
        totalInsurance: financialData.reduce((sum, f) => sum + f.insurance, 0),
        totalUtilities: financialData.reduce((sum, f) => sum + f.utilities, 0),
        totalOtherExpenses: financialData.reduce((sum, f) => sum + f.otherExpenses, 0),
        netIncome: financialData.reduce((sum, f) => sum + f.netIncome, 0),
        totalTenants: financialData.reduce((sum, f) => sum + f.totalTenants, 0),
        averageOccupancyRate: 
          financialData.length > 0
            ? financialData.reduce((sum, f) => sum + f.occupancyRate, 0) / financialData.length
            : 0,
        properties: financialData,
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update communication preferences
   */
  async updateCommunicationPreference(userId: string, preference: CommunicationPreference) {
    try {
      const ownerProfile = await prisma.ownerProfile.update({
        where: { userId },
        data: {
          communicationPreference: preference,
        },
      });

      return {
        success: true,
        data: ownerProfile,
        message: 'Communication preference updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Add co-owner to property
   */
  async addCoOwner(ownerUserId: string, coOwnerUserId: string, ownershipPercentage: number, relationshipType: string) {
    try {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { userId: ownerUserId },
      });

      const coOwnerProfile = await prisma.ownerProfile.findUnique({
        where: { userId: coOwnerUserId },
      });

      if (!ownerProfile || !coOwnerProfile) {
        throw new Error('Owner profile(s) not found');
      }

      const coOwnerRelation = await prisma.coOwnerRelation.create({
        data: {
          ownerProfileId: ownerProfile.id,
          coOwnerProfileId: coOwnerProfile.id,
          ownershipPercentage,
          relationshipType,
          approvalStatus: 'PENDING',
        },
        include: {
          ownerProfile: true,
          coOwnerProfile: true,
        },
      });

      return {
        success: true,
        data: coOwnerRelation,
        message: 'Co-owner added successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get owner communications
   */
  async getOwnerCommunications(userId: string, limit: number = 50) {
    try {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { userId },
      });

      if (!ownerProfile) {
        return {
          success: false,
          error: 'Owner profile not found',
        };
      }

      const communications = await prisma.ownerCommunication.findMany({
        where: { ownerProfileId: ownerProfile.id },
        orderBy: { sentAt: 'desc' },
        take: limit,
      });

      return {
        success: true,
        data: communications,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mark communication as read
   */
  async markCommunicationAsRead(communicationId: string) {
    try {
      const communication = await prisma.ownerCommunication.update({
        where: { id: communicationId },
        data: { readAt: new Date() },
      });

      return {
        success: true,
        data: communication,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Calculate profile completeness percentage
 */
function calculateProfileCompleteness(data: any): number {
  const fields = [
    'secondaryEmail',
    'secondaryPhone',
    'address',
    'city',
    'state',
    'zipCode',
    'country',
    'businessName',
    'panNumber',
    'gstin',
    'bankAccountNumber',
    'bankIfscCode',
    'bankAccountName',
    'emergencyContactName',
    'emergencyContactPhone',
    'emergencyContactEmail',
  ];

  const filledFields = fields.filter((field) => data[field] && data[field].toString().trim().length > 0).length;
  return Math.round((filledFields / fields.length) * 100);
}

export default new OwnerService();
