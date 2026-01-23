import express, { Router } from 'express';
import rentInvoiceController from '../controllers/rentInvoiceController';
import paymentController from '../controllers/paymentController';
import maintenanceInvoiceController from '../controllers/maintenanceInvoiceController';
import lateFeeController from '../controllers/lateFeeController';
import configurationController from '../controllers/configurationController';

const router: Router = express.Router();

// ==================== RENT INVOICE ROUTES ====================

/**
 * POST /api/finances/rent-invoices
 * Create a new rent invoice
 */
router.post('/rent-invoices', (req, res) => rentInvoiceController.createInvoice(req, res));

/**
 * GET /api/finances/rent-invoices
 * List rent invoices with filters
 */
router.get('/rent-invoices', (req, res) => rentInvoiceController.listInvoices(req, res));

/**
 * GET /api/finances/rent-invoices/:invoiceId
 * Get specific rent invoice
 */
router.get('/rent-invoices/:invoiceId', (req, res) => rentInvoiceController.getInvoice(req, res));

/**
 * PATCH /api/finances/rent-invoices/:invoiceId
 * Update rent invoice
 */
router.patch('/rent-invoices/:invoiceId', (req, res) => rentInvoiceController.updateInvoice(req, res));

/**
 * POST /api/finances/rent-invoices/:invoiceId/send
 * Send invoice to tenant
 */
router.post('/rent-invoices/:invoiceId/send', (req, res) => rentInvoiceController.sendInvoice(req, res));

/**
 * POST /api/finances/rent-invoices/:invoiceId/mark-viewed
 * Mark invoice as viewed
 */
router.post('/rent-invoices/:invoiceId/mark-viewed', (req, res) =>
  rentInvoiceController.markAsViewed(req, res),
);

/**
 * POST /api/finances/rent-invoices/:invoiceId/cancel
 * Cancel invoice
 */
router.post('/rent-invoices/:invoiceId/cancel', (req, res) =>
  rentInvoiceController.cancelInvoice(req, res),
);

/**
 * POST /api/finances/rent-invoices/generate-monthly
 * Generate monthly invoices for property
 */
router.post('/rent-invoices/generate-monthly', (req, res) =>
  rentInvoiceController.generateMonthlyInvoices(req, res),
);

/**
 * GET /api/finances/rent-invoices/property/:propertyId/summary
 * Get property rent invoice summary
 */
router.get('/rent-invoices/property/:propertyId/summary', (req, res) =>
  rentInvoiceController.getPropertySummary(req, res),
);

/**
 * POST /api/finances/rent-invoices/check-overdue
 * Check and update overdue invoices
 */
router.post('/rent-invoices/check-overdue', (req, res) => rentInvoiceController.checkOverdue(req, res));

// ==================== MAINTENANCE INVOICE ROUTES ====================

/**
 * POST /api/finances/maintenance-invoices
 * Create a new maintenance invoice
 */
router.post('/maintenance-invoices', (req, res) => maintenanceInvoiceController.createInvoice(req, res));

/**
 * GET /api/finances/maintenance-invoices
 * List maintenance invoices
 */
router.get('/maintenance-invoices', (req, res) => maintenanceInvoiceController.listInvoices(req, res));

/**
 * GET /api/finances/maintenance-invoices/:invoiceId
 * Get specific maintenance invoice
 */
router.get('/maintenance-invoices/:invoiceId', (req, res) =>
  maintenanceInvoiceController.getInvoice(req, res),
);

/**
 * PATCH /api/finances/maintenance-invoices/:invoiceId
 * Update maintenance invoice
 */
router.patch('/maintenance-invoices/:invoiceId', (req, res) =>
  maintenanceInvoiceController.updateInvoice(req, res),
);

/**
 * POST /api/finances/maintenance-invoices/:invoiceId/send
 * Send maintenance invoice
 */
router.post('/maintenance-invoices/:invoiceId/send', (req, res) =>
  maintenanceInvoiceController.sendInvoice(req, res),
);

/**
 * POST /api/finances/maintenance-invoices/generate-monthly
 * Generate monthly maintenance invoices
 */
router.post('/maintenance-invoices/generate-monthly', (req, res) =>
  maintenanceInvoiceController.generateMonthlyInvoices(req, res),
);

// ==================== PAYMENT ROUTES ====================

/**
 * POST /api/finances/payments
 * Initiate payment
 */
router.post('/payments', (req, res) => paymentController.initiatePayment(req, res));

/**
 * GET /api/finances/payments
 * List payments
 */
router.get('/payments', (req, res) => paymentController.listPayments(req, res));

/**
 * GET /api/finances/payments/:paymentId
 * Get specific payment
 */
router.get('/payments/:paymentId', (req, res) => paymentController.getPayment(req, res));

/**
 * POST /api/finances/payments/:paymentId/confirm
 * Confirm payment (from gateway webhook)
 */
router.post('/payments/:paymentId/confirm', (req, res) => paymentController.confirmPayment(req, res));

/**
 * POST /api/finances/payments/:paymentId/refund
 * Process refund
 */
router.post('/payments/:paymentId/refund', (req, res) => paymentController.refundPayment(req, res));

/**
 * GET /api/finances/payments/tenant/:tenantId/history
 * Get tenant payment history
 */
router.get('/payments/tenant/:tenantId/history', (req, res) =>
  paymentController.getTenantHistory(req, res),
);

/**
 * GET /api/finances/payments/statistics
 * Get payment statistics
 */
router.get('/payments/statistics', (req, res) => paymentController.getStatistics(req, res));

// ==================== LATE FEE ROUTES ====================

/**
 * POST /api/finances/late-fees/calculate
 * Calculate late fee
 */
router.post('/late-fees/calculate', (req, res) => lateFeeController.calculateLateFee(req, res));

/**
 * POST /api/finances/late-fees/apply
 * Apply late fee to invoice
 */
router.post('/late-fees/apply', (req, res) => lateFeeController.applyLateFee(req, res));

/**
 * POST /api/finances/late-fees/:lateFeeId/waive
 * Waive late fee
 */
router.post('/late-fees/:lateFeeId/waive', (req, res) => lateFeeController.waiveLateFee(req, res));

/**
 * GET /api/finances/late-fees/tenant/:tenantId
 * Get tenant's late fees
 */
router.get('/late-fees/tenant/:tenantId', (req, res) => lateFeeController.getTenantLateFees(req, res));

/**
 * GET /api/finances/late-fees/property/:propertyId/summary
 * Get property late fees summary
 */
router.get('/late-fees/property/:propertyId/summary', (req, res) =>
  lateFeeController.getPropertySummary(req, res),
);

// ==================== CONFIGURATION ROUTES ====================

/**
 * POST /api/finances/configurations/rent
 * Create rent configuration
 */
router.post('/configurations/rent', (req, res) => configurationController.createRentConfig(req, res));

/**
 * POST /api/finances/configurations/maintenance
 * Create maintenance fee configuration
 */
router.post('/configurations/maintenance', (req, res) =>
  configurationController.createMaintenanceFeeConfig(req, res),
);

/**
 * GET /api/finances/configurations/rent/:configId
 * Get rent configuration
 */
router.get('/configurations/rent/:configId', (req, res) =>
  configurationController.getRentConfig(req, res),
);

/**
 * GET /api/finances/configurations/maintenance/:configId
 * Get maintenance configuration
 */
router.get('/configurations/maintenance/:configId', (req, res) =>
  configurationController.getMaintenanceFeeConfig(req, res),
);

/**
 * GET /api/finances/configurations/rent/property/:propertyId
 * List rent configurations
 */
router.get('/configurations/rent/property/:propertyId', (req, res) =>
  configurationController.listRentConfigs(req, res),
);

/**
 * GET /api/finances/configurations/maintenance/property/:propertyId
 * List maintenance configurations
 */
router.get('/configurations/maintenance/property/:propertyId', (req, res) =>
  configurationController.listMaintenanceFeeConfigs(req, res),
);

/**
 * PATCH /api/finances/configurations/rent/:configId
 * Update rent configuration
 */
router.patch('/configurations/rent/:configId', (req, res) =>
  configurationController.updateRentConfig(req, res),
);

/**
 * PATCH /api/finances/configurations/maintenance/:configId
 * Update maintenance configuration
 */
router.patch('/configurations/maintenance/:configId', (req, res) =>
  configurationController.updateMaintenanceFeeConfig(req, res),
);

/**
 * DELETE /api/finances/configurations/rent/:configId
 * Delete rent configuration
 */
router.delete('/configurations/rent/:configId', (req, res) =>
  configurationController.deleteRentConfig(req, res),
);

/**
 * DELETE /api/finances/configurations/maintenance/:configId
 * Delete maintenance configuration
 */
router.delete('/configurations/maintenance/:configId', (req, res) =>
  configurationController.deleteMaintenanceFeeConfig(req, res),
);

export default router;
