import { Request, Response } from 'express';
import ownerService from '../services/ownerService';
import ownerVerificationService from '../services/ownerVerificationService';
import propertyTransferService from '../services/propertyTransferService';

class OwnerController {
  // Profile Management
  async createOwnerProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.createOwnerProfile(userId, req.body);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getOwnerProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.getOwnerProfile(userId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async updateOwnerProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.updateOwnerProfile(userId, req.body);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Property Dashboard
  async getOwnerProperties(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.getOwnerProperties(userId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async addPropertyToOwner(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { propertyId, ownershipPercentage } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.addPropertyToOwner(userId, propertyId, ownershipPercentage);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Financial Summary
  async getFinancialSummary(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.getFinancialSummary(userId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Communication Preferences
  async updateCommunicationPreference(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { preference } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.updateCommunicationPreference(userId, preference);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Co-owner Management
  async addCoOwner(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { coOwnerUserId, ownershipPercentage, relationshipType } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.addCoOwner(userId, coOwnerUserId, ownershipPercentage, relationshipType);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Communications
  async getOwnerCommunications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.getOwnerCommunications(userId, limit);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async markCommunicationAsRead(req: Request, res: Response) {
    try {
      const { communicationId } = req.params;

      const result = await ownerService.markCommunicationAsRead(communicationId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Verification Methods
  async uploadVerificationDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Get owner profile
      const ownerProfile = await (await import('../services/ownerService')).default.getOwnerProfile(userId);
      if (!ownerProfile.success) {
        return res.status(404).json(ownerProfile);
      }

      const { documentType, fileName, fileUrl } = req.body;
      const result = await ownerVerificationService.uploadVerificationDocument(
        ownerProfile.data.id,
        documentType,
        fileName,
        fileUrl,
      );

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getVerificationStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const ownerProfile = await ownerService.getOwnerProfile(userId);
      if (!ownerProfile.success) {
        return res.status(404).json(ownerProfile);
      }

      const result = await ownerVerificationService.getVerificationStatus(ownerProfile.data.id);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Transfer Methods
  async initiatePropertyTransfer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { propertyId, transferredToUserId, transferDate, reason, legalDocumentUrl } = req.body;

      const result = await propertyTransferService.initiateTransfer(
        userId,
        propertyId,
        transferredToUserId || null,
        new Date(transferDate),
        reason,
        legalDocumentUrl,
      );

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getTransferHistory(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      const result = await propertyTransferService.getPropertyTransferHistory(propertyId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getPendingTransfers(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await propertyTransferService.getPendingTransfersForOwner(userId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async submitTransferForApproval(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { transferId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await propertyTransferService.submitTransferForApproval(transferId, userId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getTransferTimeline(req: Request, res: Response) {
    try {
      const { initiationDate } = req.body;

      const timeline = propertyTransferService.getTransferTimeline(new Date(initiationDate));
      return res.status(200).json({
        success: true,
        data: timeline,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async cancelTransfer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { transferId } = req.params;
      const { reason } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await propertyTransferService.cancelTransfer(transferId, userId, reason);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Property Details
  async getPropertyDetail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { propertyId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.getPropertyDetail(userId, propertyId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async updatePropertyDetail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { propertyId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.updatePropertyDetail(userId, propertyId, req.body);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getPropertyUnits(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { propertyId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.getPropertyUnits(userId, propertyId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getPropertyTenants(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { propertyId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.getPropertyTenants(userId, propertyId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getPropertyFinancials(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { propertyId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerService.getPropertyFinancials(userId, propertyId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}

export default new OwnerController();
