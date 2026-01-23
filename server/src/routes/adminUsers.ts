import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserStats,
} from '../controllers/adminUserController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { body } from 'express-validator';

const router = express.Router();

// All routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Validation middleware
const userValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role').notEmpty().withMessage('Role is required'),
];

const updateUserValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('role').optional().notEmpty().withMessage('Role cannot be empty'),
  body('status').optional().notEmpty().withMessage('Status cannot be empty'),
];

// GET all users with pagination and filters
router.get('/', getAllUsers);

// GET user statistics
router.get('/stats', getUserStats);

// GET specific user by ID
router.get('/:id', getUserById);

// POST create new user
router.post('/', userValidation, createUser);

// PUT update user
router.put('/:id', updateUserValidation, updateUser);

// DELETE user (soft delete)
router.delete('/:id', deleteUser);

// PATCH update user role
router.patch('/:id/role', updateUserRole);

export default router;
