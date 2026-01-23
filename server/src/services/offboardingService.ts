import { PrismaClient, OffboardingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface OffboardingRequestData {
  tenantId: string;
  apartmentId: string;
  propertyId: string;
  onboardingId: string;
  moveOutDate: Date;
}

export interface DamageAssessmentData {
  damageCharges: number;
  description: string;
}

export class OffboardingService {
  /**
   * Create offboarding request
   */
  async createOffboardingRequest(data: OffboardingRequestData) {
    try {
      // Verify tenant and apartment
      const tenantAssignment = await prisma.tenantAssignment.findFirst({
        where: {
          tenantId: data.tenantId,
          apartmentId: data.apartmentId,
          isActive: true,
        },
      });

      if (!tenantAssignment) {
        throw new Error('No active tenant assignment found');
      }

      // Check if notice period is 30 days
      const today = new Date();
      const daysUntilMoveOut = Math.floor(
        (data.moveOutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilMoveOut < 30) {
        throw new Error(
          'Move-out notice must be at least 30 days in advance',
        );
      }

      // Create offboarding record
      const offboarding = await prisma.tenantOffboarding.create({
        data: {
          tenantId: data.tenantId,
          apartmentId: data.apartmentId,
          propertyId: data.propertyId,
          onboardingId: data.onboardingId,
          moveOutDate: data.moveOutDate,
          status: OffboardingStatus.REQUESTED,
        },
        include: {
          tenant: true,
          apartment: true,
          onboarding: true,
        },
      });

      return {
        success: true,
        data: offboarding,
        message: 'Offboarding request created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Schedule move-out inspection
   */
  async scheduleInspection(
    offboardingId: string,
    checklistId: string,
    inspectionDate: Date,
  ) {
    try {
      const offboarding = await prisma.tenantOffboarding.update({
        where: { id: offboardingId },
        data: {
          inspectionChecklistId: checklistId,
          status: OffboardingStatus.INSPECTION_SCHEDULED,
        },
      });

      return {
        success: true,
        data: offboarding,
        message: 'Inspection scheduled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Record move-out inspection with before/after photos
   */
  async recordMoveOutInspection(
    offboardingId: string,
    inspectionData: any,
  ) {
    try {
      const offboarding = await prisma.tenantOffboarding.findUnique({
        where: { id: offboardingId },
      });

      if (!offboarding) {
        throw new Error('Offboarding record not found');
      }

      // Get the onboarding inspection for comparison
      const onboardingInspection = await prisma.inspection.findFirst({
        where: {
          onboardingId: offboarding.onboardingId,
        },
        include: {
          photos: true,
        },
      });

      // Create move-out inspection
      const inspection = await prisma.inspection.create({
        data: {
          offboardingId,
          inspectionDate: new Date(),
          inspectedBy: inspectionData.inspectedBy,
          damageAssessment: inspectionData.damageAssessment,
          inspectionItems: {
            create: inspectionData.items.map((item: any) => ({
              checklistItemId: item.checklistItemId,
              condition: item.condition,
              notes: item.notes,
            })),
          },
          photos: {
            create: inspectionData.photos?.map((photo: any) => ({
              photoUrl: photo.photoUrl,
              beforePhoto: onboardingInspection?.photos.find(
                (p) => p.id === photo.beforePhotoId,
              )?.photoUrl,
              afterPhoto: photo.afterPhoto,
            })) || [],
          },
        },
        include: {
          inspectionItems: true,
          photos: true,
        },
      });

      // Update offboarding status
      await prisma.tenantOffboarding.update({
        where: { id: offboardingId },
        data: {
          status: OffboardingStatus.INSPECTION_COMPLETED,
        },
      });

      return {
        success: true,
        data: inspection,
        message: 'Move-out inspection recorded successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Calculate final settlement
   */
  async calculateFinalSettlement(
    offboardingId: string,
    damageAssessmentData: DamageAssessmentData,
  ) {
    try {
      const offboarding = await prisma.tenantOffboarding.findUnique({
        where: { id: offboardingId },
        include: {
          onboarding: true,
        },
      });

      if (!offboarding) {
        throw new Error('Offboarding record not found');
      }

      if (!offboarding.onboarding) {
        throw new Error('Associated onboarding record not found');
      }

      // Calculate pending dues (placeholder - can be extended with actual bill calculations)
      const pendingDues = 0; // This should be calculated from actual bills/charges

      // Calculate refund
      const securityDeposit = offboarding.onboarding.securityDeposit;
      const damageCharges = damageAssessmentData.damageCharges;
      const refundAmount =
        securityDeposit - damageCharges - pendingDues;

      // Create settlement record
      const settlement = await prisma.finalSettlement.create({
        data: {
          offboardingId,
          securityDeposit,
          damageCharges,
          pendingDues,
          refundAmount: Math.max(0, refundAmount), // No negative refunds
          refundStatus: 'PENDING',
        },
      });

      // Update offboarding status
      await prisma.tenantOffboarding.update({
        where: { id: offboardingId },
        data: {
          status: OffboardingStatus.SETTLEMENT_PENDING,
        },
      });

      return {
        success: true,
        data: {
          settlement,
          summary: {
            securityDeposit,
            damageCharges,
            pendingDues,
            refundAmount: Math.max(0, refundAmount),
          },
        },
        message: 'Final settlement calculated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    offboardingId: string,
    paymentGateway: string,
    refundDetails: any,
  ) {
    try {
      const settlement = await prisma.finalSettlement.findUnique({
        where: { offboardingId },
      });

      if (!settlement) {
        throw new Error('Settlement record not found');
      }

      // Update settlement with refund details
      const updatedSettlement = await prisma.finalSettlement.update({
        where: { offboardingId },
        data: {
          refundStatus: 'PROCESSED',
          refundDate: new Date(),
        },
      });

      // Update offboarding status
      await prisma.tenantOffboarding.update({
        where: { id: offboardingId },
        data: {
          status: OffboardingStatus.REFUND_PROCESSED,
        },
      });

      return {
        success: true,
        data: updatedSettlement,
        message: 'Refund processed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Issue clearance certificate
   */
  async issueClearanceCertificate(
    offboardingId: string,
    certificateUrl: string,
  ) {
    try {
      const offboarding = await prisma.tenantOffboarding.update({
        where: { id: offboardingId },
        data: {
          clearanceCertificate: certificateUrl,
        },
      });

      // Store certificate document
      await prisma.offboardingDocument.create({
        data: {
          offboardingId,
          documentType: 'CLEARANCE',
          fileName: `Clearance_Certificate_${new Date().getTime()}.pdf`,
          fileUrl: certificateUrl,
        },
      });

      return {
        success: true,
        data: offboarding,
        message: 'Clearance certificate issued successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Complete offboarding
   */
  async completeOffboarding(offboardingId: string) {
    try {
      const offboarding = await prisma.tenantOffboarding.findUnique({
        where: { id: offboardingId },
        include: {
          apartment: true,
          onboarding: {
            include: {
              parkingSlot: true,
            },
          },
        },
      });

      if (!offboarding) {
        throw new Error('Offboarding record not found');
      }

      // Deactivate tenant assignment
      await prisma.tenantAssignment.updateMany({
        where: {
          tenantId: offboarding.tenantId,
          apartmentId: offboarding.apartmentId,
          isActive: true,
        },
        data: {
          isActive: false,
          endDate: new Date(),
        },
      });

      // Release parking slot
      if (
        offboarding.onboarding?.parkingSlot
      ) {
        await prisma.parkingSlot.update({
          where: { id: offboarding.onboarding.parkingSlot.id },
          data: {
            status: 'AVAILABLE',
            assignedToId: null,
            releasedAt: new Date(),
          },
        });
      }

      // Complete offboarding
      const completedOffboarding = await prisma.tenantOffboarding.update({
        where: { id: offboardingId },
        data: {
          status: OffboardingStatus.COMPLETED,
          offboardingCompletedAt: new Date(),
          notificationSent: true,
        },
        include: {
          apartment: true,
          tenant: true,
        },
      });

      return {
        success: true,
        data: completedOffboarding,
        message: 'Offboarding completed successfully. Flat is now vacant.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get offboarding details
   */
  async getOffboardingDetails(offboardingId: string) {
    try {
      const offboarding = await prisma.tenantOffboarding.findUnique({
        where: { id: offboardingId },
        include: {
          tenant: true,
          apartment: {
            include: {
              property: true,
            },
          },
          onboarding: true,
          documents: true,
          finalSettlement: true,
        },
      });

      if (!offboarding) {
        throw new Error('Offboarding record not found');
      }

      return {
        success: true,
        data: offboarding,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all offboardings for property
   */
  async getPropertyOffboardings(
    propertyId: string,
    status?: OffboardingStatus,
  ) {
    try {
      const offboardings = await prisma.tenantOffboarding.findMany({
        where: {
          propertyId,
          ...(status && { status }),
        },
        include: {
          tenant: true,
          apartment: true,
          finalSettlement: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: offboardings,
        count: offboardings.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all offboardings for tenant
   */
  async getTenantOffboardings(tenantId: string) {
    try {
      const offboardings = await prisma.tenantOffboarding.findMany({
        where: { tenantId },
        include: {
          apartment: {
            include: {
              property: true,
            },
          },
          finalSettlement: true,
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: offboardings,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel offboarding request
   */
  async cancelOffboarding(offboardingId: string) {
    try {
      const offboarding = await prisma.tenantOffboarding.update({
        where: { id: offboardingId },
        data: {
          status: OffboardingStatus.CANCELLED,
        },
      });

      return {
        success: true,
        data: offboarding,
        message: 'Offboarding request cancelled',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new OffboardingService();
