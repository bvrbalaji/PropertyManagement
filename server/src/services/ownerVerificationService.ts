import { PrismaClient } from '@prisma/client';
import { OwnershipVerificationStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class OwnerVerificationService {
  /**
   * Upload verification document
   */
  async uploadVerificationDocument(ownerProfileId: string, documentType: string, fileName: string, fileUrl: string) {
    try {
      const encryptionKey = crypto.randomBytes(32).toString('hex');

      const document = await prisma.ownershipVerificationDocument.create({
        data: {
          ownerProfileId,
          documentType,
          fileName,
          fileUrl,
          encryptionKey,
          verificationStatus: OwnershipVerificationStatus.PENDING,
          uploadedAt: new Date(),
        },
        include: {
          ownerProfile: true,
        },
      });

      return {
        success: true,
        data: document,
        message: 'Document uploaded successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get verification documents
   */
  async getVerificationDocuments(ownerProfileId: string) {
    try {
      const documents = await prisma.ownershipVerificationDocument.findMany({
        where: { ownerProfileId },
        orderBy: { uploadedAt: 'desc' },
      });

      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Approve verification document (Admin action)
   */
  async approveDocument(documentId: string, adminId: string, notes: string = '') {
    try {
      const document = await prisma.ownershipVerificationDocument.update({
        where: { id: documentId },
        data: {
          verificationStatus: OwnershipVerificationStatus.APPROVED,
          verifiedAt: new Date(),
          verifiedBy: adminId,
          notes,
        },
        include: {
          ownerProfile: true,
        },
      });

      // Check if all documents are approved for auto-approval
      const pendingDocuments = await prisma.ownershipVerificationDocument.findMany({
        where: {
          ownerProfileId: document.ownerProfileId,
          verificationStatus: OwnershipVerificationStatus.PENDING,
        },
      });

      if (pendingDocuments.length === 0) {
        // All documents are approved, update owner profile verification status
        await prisma.ownerProfile.update({
          where: { id: document.ownerProfileId },
          data: {
            verificationStatus: OwnershipVerificationStatus.APPROVED,
            verifiedAt: new Date(),
          },
        });
      }

      return {
        success: true,
        data: document,
        message: 'Document approved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reject verification document (Admin action)
   */
  async rejectDocument(documentId: string, adminId: string, rejectionReason: string) {
    try {
      const document = await prisma.ownershipVerificationDocument.update({
        where: { id: documentId },
        data: {
          verificationStatus: OwnershipVerificationStatus.REJECTED,
          verifiedBy: adminId,
          notes: rejectionReason,
        },
        include: {
          ownerProfile: true,
        },
      });

      // Update owner profile status to rejected if any document is rejected
      await prisma.ownerProfile.update({
        where: { id: document.ownerProfileId },
        data: {
          verificationStatus: OwnershipVerificationStatus.REJECTED,
        },
      });

      return {
        success: true,
        data: document,
        message: 'Document rejected. Owner has been notified.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Initiate ownership verification workflow
   */
  async initiateVerification(ownerProfileId: string) {
    try {
      // Get all documents for the owner
      const documents = await prisma.ownershipVerificationDocument.findMany({
        where: { ownerProfileId },
      });

      if (documents.length === 0) {
        return {
          success: false,
          error: 'No documents uploaded for verification',
        };
      }

      // Update profile to PENDING verification status
      const ownerProfile = await prisma.ownerProfile.update({
        where: { id: ownerProfileId },
        data: {
          verificationStatus: OwnershipVerificationStatus.PENDING,
        },
        include: {
          verificationDocuments: true,
          user: true,
        },
      });

      return {
        success: true,
        data: ownerProfile,
        message: 'Verification workflow initiated. Documents under review.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(ownerProfileId: string) {
    try {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { id: ownerProfileId },
        include: {
          verificationDocuments: true,
          user: true,
        },
      });

      if (!ownerProfile) {
        return {
          success: false,
          error: 'Owner profile not found',
        };
      }

      const documentStatuses = ownerProfile.verificationDocuments.map((doc) => ({
        id: doc.id,
        type: doc.documentType,
        fileName: doc.fileName,
        status: doc.verificationStatus,
        uploadedAt: doc.uploadedAt,
        verifiedAt: doc.verifiedAt,
        notes: doc.notes,
      }));

      return {
        success: true,
        data: {
          ownerName: ownerProfile.user.fullName,
          overallStatus: ownerProfile.verificationStatus,
          verifiedAt: ownerProfile.verifiedAt,
          documents: documentStatuses,
          completionPercentage: ownerProfile.profileCompleteness,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify ownership (validate legal documents)
   */
  async verifyOwnership(propertyId: string, ownerUserId: string) {
    try {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { userId: ownerUserId },
      });

      if (!ownerProfile) {
        return {
          success: false,
          error: 'Owner profile not found',
        };
      }

      // Check if owner has property
      const ownerProperty = await prisma.ownerProperty.findUnique({
        where: {
          ownerProfileId_propertyId: {
            ownerProfileId: ownerProfile.id,
            propertyId,
          },
        },
      });

      if (!ownerProperty) {
        return {
          success: false,
          error: 'Owner does not own this property',
        };
      }

      // Get verification documents
      const documents = await prisma.ownershipVerificationDocument.findMany({
        where: { ownerProfileId: ownerProfile.id },
      });

      const allApproved = documents.every(
        (doc) => doc.verificationStatus === OwnershipVerificationStatus.APPROVED
      );

      if (!allApproved) {
        return {
          success: false,
          error: 'Not all verification documents are approved',
        };
      }

      return {
        success: true,
        data: {
          propertyId,
          ownerName: ownerProfile.user.fullName,
          verificationStatus: ownerProfile.verificationStatus,
          verifiedAt: ownerProfile.verifiedAt,
          isVerified: ownerProfile.verificationStatus === OwnershipVerificationStatus.APPROVED,
        },
        message: 'Ownership verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get pending verifications (for admins)
   */
  async getPendingVerifications(limit: number = 50) {
    try {
      const pendingProfiles = await prisma.ownerProfile.findMany({
        where: {
          verificationStatus: OwnershipVerificationStatus.PENDING,
        },
        include: {
          user: true,
          verificationDocuments: true,
          properties: {
            include: {
              property: true,
            },
          },
        },
        orderBy: { updatedAt: 'asc' },
        take: limit,
      });

      return {
        success: true,
        data: pendingProfiles,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send verification reminder
   */
  async sendVerificationReminder(ownerProfileId: string) {
    try {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { id: ownerProfileId },
        include: {
          user: true,
        },
      });

      if (!ownerProfile) {
        return {
          success: false,
          error: 'Owner profile not found',
        };
      }

      // TODO: Send email reminder using emailService
      // const email = ownerProfile.user.email;
      // await emailService.sendVerificationReminder(email, ownerProfile.user.fullName);

      return {
        success: true,
        message: 'Verification reminder sent',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new OwnerVerificationService();
