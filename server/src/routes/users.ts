import express from 'express';
import { body } from 'express-validator';
import { getUsers, getUser, createUser, updateUser, deactivateUser } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (Admin only)
router.get('/', authorize(UserRole.ADMIN), getUsers);

// Get user by ID
router.get('/:id', getUser);

// Create user (Admin only)
router.post(
  '/',
  authorize(UserRole.ADMIN),
  [
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone(),
    body('password').isLength({ min: 8 }),
    body('fullName').trim().isLength({ min: 2 }),
    body('role').isIn(['ADMIN', 'FLAT_OWNER', 'TENANT', 'MAINTENANCE_STAFF']),
  ],
  createUser
);

// Update user (Admin only)
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone(),
    body('fullName').optional().trim().isLength({ min: 2 }),
    body('role').optional().isIn(['ADMIN', 'FLAT_OWNER', 'TENANT', 'MAINTENANCE_STAFF']),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  ],
  updateUser
);

// Deactivate user (Admin only)
router.delete('/:id', authorize(UserRole.ADMIN), deactivateUser);

export default router;
