import express from 'express';
import { body } from 'express-validator';
import { setupMFA, verifyMFA, disableMFA } from '../controllers/mfaController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Setup MFA (Admin only)
router.post('/setup', authorize(UserRole.ADMIN), setupMFA);

// Verify MFA code
router.post(
  '/verify',
  [body('code').isLength({ min: 6, max: 6 })],
  verifyMFA
);

// Disable MFA (Admin only)
router.post('/disable', authorize(UserRole.ADMIN), disableMFA);

export default router;
