import { PrismaClient } from '@prisma/client';
import { OwnershipTransferStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class PropertyTransferService {
  /**
   * Initiate property transfer
   */
  async initiateTransfer(
    initiatedByUserId: string,
    propertyId: string,
    transferredToUserId: string | null,
    transferDate: Date,
    reason: string = '',
    legalDocumentUrl: string = '',
    ownershipPercentage: number = 100,
  ) {
    try {
      const transfer = await prisma.ownershipTransfer.create({
        data: {
          initiatedByUserId,
          transferredToUserId,
          propertyId,
          ownershipPercentage,
          transferDate,
          reason,
          legalDocumentUrl,
          status: OwnershipTransferStatus.INITIATED,
        },
        include: {
          initiatedByUser: true,
          transferredToUser: true,
          initiatorProfile: true,
        },
      });

      return {
        success: true,
        data: transfer,
        message: 'Property transfer initiated. Awaiting approval.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get transfer details
   */
  async getTransferDetails(transferId: string) {
    try {
      const transfer = await prisma.ownershipTransfer.findUnique({
        where: { id: transferId },
        include: {
          initiatedByUser: true,
          transferredToUser: true,
          initiatorProfile: {
            include: {
              user: true,
            },
          },
          recipientProfile: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!transfer) {
        return {
          success: false,
          error: 'Transfer not found',
        };
      }

      return {
        success: true,
        data: transfer,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get transfer history for a property
   */
  async getPropertyTransferHistory(propertyId: string) {
    try {
      const transfers = await prisma.ownershipTransfer.findMany({
        where: { propertyId },
        include: {
          initiatedByUser: true,
          transferredToUser: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: transfers,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get pending transfers for an owner
   */
  async getPendingTransfersForOwner(userId: string) {
    try {
      const transfers = await prisma.ownershipTransfer.findMany({
        where: {
          OR: [
            { initiatedByUserId: userId, status: OwnershipTransferStatus.INITIATED },
            { transferredToUserId: userId, status: OwnershipTransferStatus.PENDING_APPROVAL },
          ],
        },
        include: {
          initiatedByUser: true,
          transferredToUser: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: transfers,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Submit transfer for approval (Owner action)
   */
  async submitTransferForApproval(transferId: string, ownerUserId: string) {
    try {
      const transfer = await prisma.ownershipTransfer.findUnique({
        where: { id: transferId },
      });

      if (!transfer) {
        return {
          success: false,
          error: 'Transfer not found',
        };
      }

      if (transfer.initiatedByUserId !== ownerUserId) {
        return {
          success: false,
          error: 'Unauthorized. Only initiator can submit for approval.',
        };
      }

      const updatedTransfer = await prisma.ownershipTransfer.update({
        where: { id: transferId },
        data: {
          status: OwnershipTransferStatus.PENDING_APPROVAL,
        },
        include: {
          initiatedByUser: true,
          transferredToUser: true,
        },
      });

      return {
        success: true,
        data: updatedTransfer,
        message: 'Transfer submitted for approval. Expected completion in 5 business days.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Approve transfer (Admin action)
   */
  async approveTransfer(transferId: string, adminId: string) {
    try {
      const transfer = await prisma.ownershipTransfer.findUnique({
        where: { id: transferId },
        include: {
          initiatorProfile: true,
          recipientProfile: true,
        },
      });

      if (!transfer) {
        return {
          success: false,
          error: 'Transfer not found',
        };
      }

      // Update transfer status
      const updatedTransfer = await prisma.ownershipTransfer.update({
        where: { id: transferId },
        data: {
          status: OwnershipTransferStatus.APPROVED,
          approvedBy: adminId,
        },
      });

      // If full ownership transfer, update owner property
      if (transfer.ownershipPercentage === 100 && transfer.recipientProfile) {
        // Mark previous owner property as inactive
        await prisma.ownerProperty.updateMany({
          where: {
            propertyId: transfer.propertyId,
            ownerProfileId: transfer.initiatorProfile.id,
          },
          data: {
            isActive: false,
            ownershipEndDate: new Date(),
          },
        });

        // Add property to new owner
        await prisma.ownerProperty.create({
          data: {
            ownerProfileId: transfer.recipientProfile.id,
            propertyId: transfer.propertyId,
            ownershipPercentage: 100,
            ownershipStartDate: new Date(),
            isActive: true,
          },
        });
      }

      return {
        success: true,
        data: updatedTransfer,
        message: 'Property transfer approved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reject transfer (Admin action)
   */
  async rejectTransfer(transferId: string, adminId: string, rejectionReason: string) {
    try {
      const transfer = await prisma.ownershipTransfer.update({
        where: { id: transferId },
        data: {
          status: OwnershipTransferStatus.REJECTED,
          rejectionReason,
          approvedBy: adminId,
        },
        include: {
          initiatedByUser: true,
          transferredToUser: true,
        },
      });

      return {
        success: true,
        data: transfer,
        message: 'Transfer rejected. Owner has been notified.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Complete transfer (Auto-triggered after approval period)
   */
  async completeTransfer(transferId: string) {
    try {
      const transfer = await prisma.ownershipTransfer.findUnique({
        where: { id: transferId },
        include: {
          recipientProfile: true,
        },
      });

      if (!transfer) {
        return {
          success: false,
          error: 'Transfer not found',
        };
      }

      if (transfer.status !== OwnershipTransferStatus.APPROVED) {
        return {
          success: false,
          error: 'Transfer must be approved before completion',
        };
      }

      const completedTransfer = await prisma.ownershipTransfer.update({
        where: { id: transferId },
        data: {
          status: OwnershipTransferStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          initiatedByUser: true,
          transferredToUser: true,
        },
      });

      return {
        success: true,
        data: completedTransfer,
        message: 'Property transfer completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get transfer timeline (estimated dates)
   */
  getTransferTimeline(initiationDate: Date): any {
    const timeline = {
      initiationDate,
      submissionDeadline: new Date(initiationDate.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day
      approvalDeadline: new Date(initiationDate.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
      completionDeadline: new Date(initiationDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 business days
      steps: [
        { name: 'Initiation', date: initiationDate, status: 'COMPLETED' },
        {
          name: 'Submission',
          date: new Date(initiationDate.getTime() + 1 * 24 * 60 * 60 * 1000),
          status: 'IN_PROGRESS',
        },
        {
          name: 'Admin Review',
          date: new Date(initiationDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
        },
        {
          name: 'Completion',
          date: new Date(initiationDate.getTime() + 5 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
        },
      ],
    };

    return timeline;
  }

  /**
   * Cancel transfer (Only if not approved)
   */
  async cancelTransfer(transferId: string, userId: string, reason: string = '') {
    try {
      const transfer = await prisma.ownershipTransfer.findUnique({
        where: { id: transferId },
      });

      if (!transfer) {
        return {
          success: false,
          error: 'Transfer not found',
        };
      }

      if (transfer.initiatedByUserId !== userId) {
        return {
          success: false,
          error: 'Only the initiator can cancel the transfer',
        };
      }

      if (transfer.status === OwnershipTransferStatus.COMPLETED) {
        return {
          success: false,
          error: 'Cannot cancel completed transfers',
        };
      }

      const cancelledTransfer = await prisma.ownershipTransfer.update({
        where: { id: transferId },
        data: {
          status: OwnershipTransferStatus.REJECTED,
          rejectionReason: reason || 'Cancelled by owner',
        },
      });

      return {
        success: true,
        data: cancelledTransfer,
        message: 'Transfer cancelled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new PropertyTransferService();
