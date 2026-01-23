import express from 'express';
import offboardingController from '../controllers/offboardingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

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
// COMMENTED OUT - Payment process to be enabled later
// router.post(
//   '/:offboardingId/process-refund',
//   offboardingController.processRefund,
// );

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
