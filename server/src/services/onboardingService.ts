import { PrismaClient, OnboardingStatus, VehicleType } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface OnboardingFormData {
  tenantId: string;
  apartmentId: string;
  propertyId: string;
  moveInDate: Date;
  securityDeposit: number;
  vehicleType: VehicleType;
  contactPhone: string;
  emergencyContact: string;
}

export interface InspectionChecklistItem {
  itemName: string;
  category: string;
}

export class OnboardingService {
  /**
   * Create tenant onboarding record
   */
  async createOnboarding(data: OnboardingFormData) {
    try {
      // Verify apartment exists and is available
      const apartment = await prisma.apartment.findUnique({
        where: { id: data.apartmentId },
      });

      if (!apartment) {
        throw new Error('Apartment not found');
      }

      // Check if apartment is already assigned
      const existingAssignment = await prisma.tenantAssignment.findFirst({
        where: {
          apartmentId: data.apartmentId,
          isActive: true,
        },
      });

      if (existingAssignment) {
        throw new Error('Apartment is already assigned to another tenant');
      }

      // Create onboarding record
      const onboarding = await prisma.tenantOnboarding.create({
        data: {
          tenantId: data.tenantId,
          apartmentId: data.apartmentId,
          propertyId: data.propertyId,
          moveInDate: data.moveInDate,
          securityDeposit: data.securityDeposit,
          status: OnboardingStatus.INQUIRY,
        },
        include: {
          tenant: true,
          apartment: true,
        },
      });

      return {
        success: true,
        data: onboarding,
        message: 'Onboarding inquiry created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update onboarding status
   */
  async updateOnboardingStatus(
    onboardingId: string,
    status: OnboardingStatus,
  ) {
    try {
      const onboarding = await prisma.tenantOnboarding.update({
        where: { id: onboardingId },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        data: onboarding,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload lease agreement document
   */
  async uploadLeaseAgreement(
    onboardingId: string,
    fileUrl: string,
    fileName: string,
  ) {
    try {
      const document = await prisma.onboardingDocument.create({
        data: {
          onboardingId,
          documentType: 'LEASE',
          fileName,
          fileUrl,
          encryptionKey: this.generateEncryptionKey(),
        },
      });

      return {
        success: true,
        data: document,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload vehicle registration document
   */
  async uploadVehicleRegistration(
    onboardingId: string,
    fileUrl: string,
    fileName: string,
  ) {
    try {
      const document = await prisma.onboardingDocument.create({
        data: {
          onboardingId,
          documentType: 'VEHICLE_REG',
          fileName,
          fileUrl,
          encryptionKey: this.generateEncryptionKey(),
        },
      });

      return {
        success: true,
        data: document,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sign lease agreement digitally
   */
  async signLeaseAgreement(
    onboardingId: string,
    signature: string,
  ) {
    try {
      const onboarding = await prisma.tenantOnboarding.update({
        where: { id: onboardingId },
        data: {
          leaseSignedAt: new Date(),
          status: OnboardingStatus.LEASE_SIGNED,
        },
      });

      // Store signature with the lease document
      const document = await prisma.onboardingDocument.findFirst({
        where: {
          onboardingId,
          documentType: 'LEASE',
        },
      });

      if (document) {
        await prisma.onboardingDocument.update({
          where: { id: document.id },
          data: {
            fileUrl: `${document.fileUrl}?signature=${encodeURIComponent(signature)}`,
          },
        });
      }

      return {
        success: true,
        data: onboarding,
        message: 'Lease agreement signed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Record security deposit payment
   */
  async recordSecurityDeposit(
    onboardingId: string,
    amount: number,
    paymentGateway: string,
    paymentId: string,
    transactionId: string,
  ) {
    try {
      const payment = await prisma.onboardingPayment.create({
        data: {
          onboardingId,
          amount,
          paymentGateway,
          paymentId,
          transactionId,
          status: 'SUCCESS',
          paidAt: new Date(),
        },
      });

      // Update onboarding status
      const onboarding = await prisma.tenantOnboarding.update({
        where: { id: onboardingId },
        data: {
          depositPaid: amount,
          status: OnboardingStatus.DEPOSIT_PENDING,
        },
      });

      return {
        success: true,
        data: {
          payment,
          onboarding,
        },
        message: 'Security deposit recorded successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get onboarding details
   */
  async getOnboardingDetails(onboardingId: string) {
    try {
      const onboarding = await prisma.tenantOnboarding.findUnique({
        where: { id: onboardingId },
        include: {
          tenant: true,
          apartment: true,
          property: true,
          parkingSlot: true,
          documents: true,
          payments: true,
        },
      });

      if (!onboarding) {
        throw new Error('Onboarding record not found');
      }

      return {
        success: true,
        data: onboarding,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all onboardings for a property
   */
  async getPropertyOnboardings(propertyId: string, status?: OnboardingStatus) {
    try {
      const onboardings = await prisma.tenantOnboarding.findMany({
        where: {
          propertyId,
          ...(status && { status }),
        },
        include: {
          tenant: true,
          apartment: true,
          parkingSlot: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: onboardings,
        count: onboardings.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all onboardings for a tenant
   */
  async getTenantOnboardings(tenantId: string) {
    try {
      const onboardings = await prisma.tenantOnboarding.findMany({
        where: { tenantId },
        include: {
          apartment: {
            include: {
              property: true,
            },
          },
          parkingSlot: true,
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: onboardings,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create inspection checklist for property
   */
  async createInspectionChecklist(
    propertyId: string,
    name: string,
    items: InspectionChecklistItem[],
    isForOnboarding: boolean = true,
  ) {
    try {
      const checklist = await prisma.inspectionChecklist.create({
        data: {
          propertyId,
          name,
          isForOnboarding,
          items: {
            create: items.map((item) => ({
              itemName: item.itemName,
              category: item.category,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return {
        success: true,
        data: checklist,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get inspection checklists for property
   */
  async getInspectionChecklists(propertyId: string, isForOnboarding?: boolean) {
    try {
      const checklists = await prisma.inspectionChecklist.findMany({
        where: {
          propertyId,
          ...(isForOnboarding !== undefined && { isForOnboarding }),
        },
        include: {
          items: true,
        },
      });

      return {
        success: true,
        data: checklists,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create inspection record
   */
  async createInspection(
    onboardingId: string,
    checklistId: string,
    inspectionData: any,
  ) {
    try {
      const inspection = await prisma.inspection.create({
        data: {
          onboardingId,
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
              beforePhoto: photo.beforePhoto,
              afterPhoto: photo.afterPhoto,
            })) || [],
          },
        },
        include: {
          inspectionItems: true,
          photos: true,
        },
      });

      // Update onboarding status
      await prisma.tenantOnboarding.update({
        where: { id: onboardingId },
        data: {
          status: OnboardingStatus.INSPECTION_PENDING,
        },
      });

      return {
        success: true,
        data: inspection,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(onboardingId: string) {
    try {
      const onboarding = await prisma.tenantOnboarding.findUnique({
        where: { id: onboardingId },
      });

      if (!onboarding) {
        throw new Error('Onboarding record not found');
      }

      // Verify all requirements are met
      if (
        onboarding.depositPaid < onboarding.securityDeposit ||
        !onboarding.leaseSignedAt ||
        !onboarding.parkingSlotId
      ) {
        throw new Error(
          'Onboarding cannot be completed. Missing requirements: ' +
            (onboarding.depositPaid < onboarding.securityDeposit
              ? 'security deposit, '
              : '') +
            (!onboarding.leaseSignedAt ? 'lease signature, ' : '') +
            (!onboarding.parkingSlotId ? 'parking slot assignment' : ''),
        );
      }

      // Create tenant assignment
      await prisma.tenantAssignment.create({
        data: {
          apartmentId: onboarding.apartmentId,
          tenantId: onboarding.tenantId,
          startDate: onboarding.moveInDate,
          isActive: true,
        },
      });

      // Update apartment status
      const updatedOnboarding = await prisma.tenantOnboarding.update({
        where: { id: onboardingId },
        data: {
          status: OnboardingStatus.COMPLETED,
          onboardingCompletedAt: new Date(),
          notificationSent: true,
        },
        include: {
          tenant: true,
          apartment: true,
        },
      });

      return {
        success: true,
        data: updatedOnboarding,
        message: 'Onboarding completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate encryption key for sensitive documents
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

export default new OnboardingService();
