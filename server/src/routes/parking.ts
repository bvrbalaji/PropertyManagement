import express from 'express';
import parkingController from '../controllers/parkingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Parking slot management
router.post('/:propertyId/slots', parkingController.createParkingSlots);
router.get(
  '/:propertyId/available',
  parkingController.getAvailableSlots,
);
router.get('/:propertyId/all', parkingController.getPropertyParkingSlots);
router.get('/slot/:parkingSlotId', parkingController.getParkingSlotDetails);

// Update parking slot status
router.put(
  '/slot/:parkingSlotId/status',
  parkingController.updateParkingSlotStatus,
);

// Parking statistics
router.get(
  '/:propertyId/statistics',
  parkingController.getParkingStatistics,
);

export default router;
