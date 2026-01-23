import express from 'express';
import onboardingController from '../controllers/onboardingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Onboarding management
router.post('/', onboardingController.createOnboarding);
router.get('/:onboardingId', onboardingController.getOnboarding);
router.get('/tenant/:tenantId', onboardingController.getTenantOnboardings);
router.get('/property/:propertyId', onboardingController.getPropertyOnboardings);

// Document uploads
router.post(
  '/:onboardingId/lease-agreement',
  onboardingController.uploadLeaseAgreement,
);
router.post(
  '/:onboardingId/vehicle-registration',
  onboardingController.uploadVehicleRegistration,
);

// Lease signing
router.post(
  '/:onboardingId/sign-lease',
  onboardingController.signLeaseAgreement,
);

// Security deposit payment
// COMMENTED OUT - Payment process to be enabled later
// router.post(
//   '/:onboardingId/initiate-payment',
//   onboardingController.initiateSecurityDepositPayment,
// );
// router.post(
//   '/:onboardingId/verify-payment',
//   onboardingController.verifySecurityDepositPayment,
// );

// Parking assignment
router.post(
  '/:onboardingId/assign-parking',
  onboardingController.assignParkingSlot,
);

// Inspection management
router.post(
  '/property/:propertyId/inspection-checklist',
  onboardingController.createInspectionChecklist,
);
router.get(
  '/property/:propertyId/inspection-checklists',
  onboardingController.getInspectionChecklists,
);
router.post(
  '/:onboardingId/move-in-inspection',
  onboardingController.createMoveInInspection,
);

// Complete onboarding
router.post(
  '/:onboardingId/complete',
  onboardingController.completeOnboarding,
);

export default router;
