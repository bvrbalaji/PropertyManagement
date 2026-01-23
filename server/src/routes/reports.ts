import express from 'express';
import reportsController from '../controllers/reportsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * All routes require authentication
 * TODO: Add role-based access control for admin-only routes
 */
router.use(authMiddleware);

/**
 * GET /api/reports/collection-summary
 * Get monthly collection summary with date range and property filters
 * Query params:
 *   - startDate: ISO date string (optional, defaults to first day of current month)
 *   - endDate: ISO date string (optional, defaults to today)
 *   - propertyId: string (optional, for single property)
 */
router.get('/collection-summary', (req, res) => reportsController.getMonthlyCollectionSummary(req, res));

/**
 * GET /api/reports/outstanding-dues
 * Get outstanding dues with aging analysis
 * Query params:
 *   - sortBy: 'days' | 'amount' (optional, defaults to 'days')
 *   - propertyId: string (optional)
 */
router.get('/outstanding-dues', (req, res) => reportsController.getOutstandingDuesReport(req, res));

/**
 * GET /api/reports/yoy-comparison
 * Get year-over-year financial comparison
 * Query params:
 *   - year: number (optional, defaults to current year)
 */
router.get('/yoy-comparison', (req, res) => reportsController.getYearOverYearComparison(req, res));

/**
 * GET /api/reports/cash-flow
 * Get cash flow statement
 * Query params:
 *   - months: number (optional, defaults to 12)
 */
router.get('/cash-flow', (req, res) => reportsController.getCashFlowStatement(req, res));

/**
 * GET /api/reports/health
 * Get overall financial health status and score
 */
router.get('/health', (req, res) => reportsController.getFinancialHealth(req, res));

/**
 * POST /api/reports/export
 * Export report data in specified format
 * Body params:
 *   - reportType: 'collection' | 'dues' | 'yoy' | 'cashflow'
 *   - format: 'excel' | 'pdf' | 'csv'
 *   - filters: object (optional filters for the report)
 *
 * FEATURE: Export functionality
 * TODO: Implement Excel export using xlsx library
 * TODO: Implement PDF export using pdfkit or similar
 * TODO: Implement CSV export
 * TODO: Add file streaming for large reports
 * TODO: Set proper HTTP headers for file download
 * TODO: Add virus scanning before download
 */
router.post('/export', (req, res) => reportsController.exportReport(req, res));

export default router;
