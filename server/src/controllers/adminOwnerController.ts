import { Request, Response } from 'express';
import ownerVerificationService from '../services/ownerVerificationService';
import propertyTransferService from '../services/propertyTransferService';

class AdminOwnerController {
  // Verification Management
  async getPendingVerifications(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await ownerVerificationService.getPendingVerifications(limit);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async approveDocument(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;
      const { documentId } = req.params;
      const { notes } = req.body;

      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerVerificationService.approveDocument(documentId, adminId, notes);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async rejectDocument(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;
      const { documentId } = req.params;
      const { rejectionReason } = req.body;

      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await ownerVerificationService.rejectDocument(documentId, adminId, rejectionReason);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getVerificationStatus(req: Request, res: Response) {
    try {
      const { ownerProfileId } = req.params;

      const result = await ownerVerificationService.getVerificationStatus(ownerProfileId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  // Transfer Management
  async getPendingTransfers(req: Request, res: Response) {
    try {
      // Get all pending transfers (admin view)
      const transfers = await (await import('../services/propertyTransferService')).default.getPropertyTransferHistory(
        req.query.propertyId as string,
      );

      return res.status(transfers.success ? 200 : 404).json(transfers);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getTransferDetails(req: Request, res: Response) {
    try {
      const { transferId } = req.params;

      const result = await propertyTransferService.getTransferDetails(transferId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async approveTransfer(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;
      const { transferId } = req.params;

      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await propertyTransferService.approveTransfer(transferId, adminId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async rejectTransfer(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;
      const { transferId } = req.params;
      const { rejectionReason } = req.body;

      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await propertyTransferService.rejectTransfer(transferId, adminId, rejectionReason);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async completeTransfer(req: Request, res: Response) {
    try {
      const { transferId } = req.params;

      const result = await propertyTransferService.completeTransfer(transferId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}

export default new AdminOwnerController();
