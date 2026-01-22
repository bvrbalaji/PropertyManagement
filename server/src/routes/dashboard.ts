import express from 'express';
import { getAdminDashboard, getFlatOwnerDashboard, getTenantDashboard, getMaintenanceDashboard } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin dashboard
router.get('/admin', authorize(UserRole.ADMIN), getAdminDashboard);

// Flat Owner dashboard
router.get('/flat-owner', authorize(UserRole.FLAT_OWNER), getFlatOwnerDashboard);

// Tenant dashboard
router.get('/tenant', authorize(UserRole.TENANT), getTenantDashboard);

// Maintenance Staff dashboard
router.get('/maintenance', authorize(UserRole.MAINTENANCE_STAFF), getMaintenanceDashboard);

export default router;
