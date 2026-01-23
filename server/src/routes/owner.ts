import express from 'express';
import ownerController from '../controllers/ownerController';
import adminOwnerController from '../controllers/adminOwnerController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// ===== OWNER PROFILE MANAGEMENT =====
// GET /api/owner/profile - Get owner profile
router.get('/profile', ownerController.getOwnerProfile);

// POST /api/owner/profile - Create owner profile
router.post('/profile', ownerController.createOwnerProfile);

// PUT /api/owner/profile - Update owner profile
router.put('/profile', ownerController.updateOwnerProfile);

// ===== OWNER PROPERTIES DASHBOARD =====
// GET /api/owner/properties - Get all properties for owner (Dashboard)
router.get('/properties', ownerController.getOwnerProperties);

// POST /api/owner/properties - Add property to owner
router.post('/properties', ownerController.addPropertyToOwner);

// ===== FINANCIAL SUMMARY =====
// GET /api/owner/financial-summary - Get financial summary for all properties (Real-time)
router.get('/financial-summary', ownerController.getFinancialSummary);

// ===== COMMUNICATION PREFERENCES =====
// PUT /api/owner/communication-preference - Update communication preference
router.put('/communication-preference', ownerController.updateCommunicationPreference);

// ===== CO-OWNER MANAGEMENT =====
// POST /api/owner/co-owners - Add co-owner
router.post('/co-owners', ownerController.addCoOwner);

// ===== OWNER COMMUNICATIONS =====
// GET /api/owner/communications - Get owner communications (Notifications/Announcements)
router.get('/communications', ownerController.getOwnerCommunications);

// PUT /api/owner/communications/:communicationId/read - Mark communication as read
router.put('/communications/:communicationId/read', ownerController.markCommunicationAsRead);

// ===== OWNERSHIP VERIFICATION =====
// POST /api/owner/verification/documents - Upload verification document
router.post('/verification/documents', ownerController.uploadVerificationDocument);

// GET /api/owner/verification/status - Get verification status
router.get('/verification/status', ownerController.getVerificationStatus);

// ===== PROPERTY TRANSFER =====
// POST /api/owner/transfer/initiate - Initiate property transfer
router.post('/transfer/initiate', ownerController.initiatePropertyTransfer);

// GET /api/owner/transfer/pending - Get pending transfers for owner
router.get('/transfer/pending', ownerController.getPendingTransfers);

// PUT /api/owner/transfer/:transferId/submit - Submit transfer for approval
router.put('/transfer/:transferId/submit', ownerController.submitTransferForApproval);

// POST /api/owner/transfer/timeline - Get transfer timeline
router.post('/transfer/timeline', ownerController.getTransferTimeline);

// DELETE /api/owner/transfer/:transferId - Cancel transfer
router.delete('/transfer/:transferId', ownerController.cancelTransfer);

// GET /api/owner/transfer/history/:propertyId - Get transfer history for property
router.get('/transfer/history/:propertyId', ownerController.getTransferHistory);

// ===== ADMIN ROUTES (For approval workflows) =====
// GET /api/owner/admin/verification/pending - Get pending verifications (Admin only)
router.get('/admin/verification/pending', adminOwnerController.getPendingVerifications);

// PUT /api/owner/admin/verification/:documentId/approve - Approve verification document (Admin)
router.put('/admin/verification/:documentId/approve', adminOwnerController.approveDocument);

// PUT /api/owner/admin/verification/:documentId/reject - Reject verification document (Admin)
router.put('/admin/verification/:documentId/reject', adminOwnerController.rejectDocument);

// GET /api/owner/admin/verification/:ownerProfileId/status - Get verification status (Admin)
router.get('/admin/verification/:ownerProfileId/status', adminOwnerController.getVerificationStatus);

// GET /api/owner/admin/transfer/pending - Get pending transfers (Admin)
router.get('/admin/transfer/pending', adminOwnerController.getPendingTransfers);

// GET /api/owner/admin/transfer/:transferId - Get transfer details (Admin)
router.get('/admin/transfer/:transferId', adminOwnerController.getTransferDetails);

// PUT /api/owner/admin/transfer/:transferId/approve - Approve transfer (Admin)
router.put('/admin/transfer/:transferId/approve', adminOwnerController.approveTransfer);

// PUT /api/owner/admin/transfer/:transferId/reject - Reject transfer (Admin)
router.put('/admin/transfer/:transferId/reject', adminOwnerController.rejectTransfer);

// PUT /api/owner/admin/transfer/:transferId/complete - Complete transfer (Admin)
router.put('/admin/transfer/:transferId/complete', adminOwnerController.completeTransfer);

export default router;
