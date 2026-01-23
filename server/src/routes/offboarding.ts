import express from 'express';
import offboardingController from '../controllers/offboardingController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Offboarding management
router.post('/', offboardingController.createOffboardingRequest);
router.get('/:offboardingId', offboardingController.getOffboarding);
router.get('/tenant/:tenantId', offboardingController.getTenantOffboardings);
router.get('/property/:propertyId', offboardingController.getPropertyOffboardings);

// Inspection scheduling
router.post(
  '/:offboardingId/schedule-inspection',
  offboardingController.scheduleInspection,
);

// Move-out inspection
router.post(
  '/:offboardingId/move-out-inspection',
  offboardingController.recordMoveOutInspection,
);

// Settlement and refunds
router.post(
  '/:offboardingId/calculate-settlement',
  offboardingController.calculateFinalSettlement,
);
router.post(
  '/:offboardingId/process-refund',
  offboardingController.processRefund,
);

// Clearance certificate
router.post(
  '/:offboardingId/issue-certificate',
  offboardingController.issueClearanceCertificate,
);

// Complete offboarding
router.post(
  '/:offboardingId/complete',
  offboardingController.completeOffboarding,
);

// Cancel offboarding
router.post(
  '/:offboardingId/cancel',
  offboardingController.cancelOffboarding,
);

export default router;
