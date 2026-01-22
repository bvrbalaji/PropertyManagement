import express from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, verifyOTP, logout, refreshToken, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Registration
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone(),
    body('password').isLength({ min: 8 }),
    body('fullName').trim().isLength({ min: 2 }),
    body('role').isIn(['ADMIN', 'FLAT_OWNER', 'TENANT', 'MAINTENANCE_STAFF']),
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('emailOrPhone').notEmpty(),
    body('password').notEmpty(),
  ],
  login
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('userId').notEmpty(),
    body('code').isLength({ min: 6, max: 6 }),
    body('type').isIn(['EMAIL', 'PHONE']),
  ],
  verifyOTP
);

// Logout
router.post('/logout', authenticate, logout);

// Refresh token
router.post('/refresh', refreshToken);

// Forgot password
router.post(
  '/forgot-password',
  [body('emailOrPhone').notEmpty()],
  forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
  resetPassword
);

export default router;
