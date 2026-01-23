import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats,
} from '../controllers/adminPropertyController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { body } from 'express-validator';

const router = express.Router();

// All routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Validation middleware
const propertyValidation = [
  body('name').trim().notEmpty().withMessage('Property name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

// GET all properties with pagination and filters
router.get('/', getAllProperties);

// GET property statistics
router.get('/stats', getPropertyStats);

// GET specific property by ID
router.get('/:id', getPropertyById);

// POST create new property
router.post('/', propertyValidation, createProperty);

// PUT update property
router.put('/:id', propertyValidation, updateProperty);

// DELETE property
router.delete('/:id', deleteProperty);

export default router;
