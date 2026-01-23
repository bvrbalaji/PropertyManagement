import { Request, Response } from 'express';
import reportService from '../services/reportService';

export class ReportController {
  /**
   * GET /api/reports/collection-summary
   * Get monthly collection summary with filters
   */
  async getMonthlyCollectionSummary(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const data = await reportService.getMonthlyCollectionSummary(start, end);

      res.json({
        success: true,
        data,
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error in getMonthlyCollectionSummary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate collection summary',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/reports/outstanding-dues
   * Get outstanding dues with aging analysis
   */
  async getOutstandingDuesReport(req: Request, res: Response) {
    try {
      const { sortBy, propertyId } = req.query;

      const data = await reportService.getOutstandingDuesReport(
        (sortBy as 'days' | 'amount') || 'days',
        propertyId as string
      );

      res.json({
        success: true,
        data,
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error in getOutstandingDuesReport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate outstanding dues report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/reports/yoy-comparison
   * Get year-over-year financial comparison
   */
  async getYearOverYearComparison(req: Request, res: Response) {
    try {
      const { year } = req.query;

      const data = await reportService.getYearOverYearComparison(
        year ? parseInt(year as string) : undefined
      );

      res.json({
        success: true,
        data,
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error in getYearOverYearComparison:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate year-over-year comparison',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/reports/cash-flow
   * Get cash flow statement
   */
  async getCashFlowStatement(req: Request, res: Response) {
    try {
      const { months } = req.query;

      const data = await reportService.getCashFlowStatement(
        months ? parseInt(months as string) : 12
      );

      res.json({
        success: true,
        data,
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error in getCashFlowStatement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate cash flow statement',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/reports/health
   * Get overall financial health status
   */
  async getFinancialHealth(req: Request, res: Response) {
    try {
      const duesReport = await reportService.getOutstandingDuesReport();
      const cashFlow = await reportService.getCashFlowStatement(12);

      // Calculate health score
      const overduePercentage = duesReport.totalOutstanding > 0
        ? (duesReport.totalOverdue / duesReport.totalOutstanding) * 100
        : 0;

      let healthScore = 100;
      if (overduePercentage > 50) healthScore -= 30;
      else if (overduePercentage > 30) healthScore -= 20;
      else if (overduePercentage > 10) healthScore -= 10;

      if (cashFlow.netCashFlow < 0) healthScore -= 15;

      const status =
        healthScore >= 80 ? 'EXCELLENT' :
        healthScore >= 60 ? 'GOOD' :
        healthScore >= 40 ? 'WARNING' :
        'CRITICAL';

      res.json({
        success: true,
        data: {
          healthScore,
          status,
          metrics: {
            overduePercentage,
            netCashFlow: cashFlow.netCashFlow,
            currentBalance: cashFlow.currentBalance,
            totalOutstanding: duesReport.totalOutstanding,
          },
        },
      });
    } catch (error) {
      console.error('Error in getFinancialHealth:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate financial health',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/reports/export
   * Export report data (placeholder for future implementation)
   */
  async exportReport(req: Request, res: Response) {
    try {
      const { reportType, format } = req.body;

      // TODO: Implement export functionality
      // TODO: Add support for Excel export
      // TODO: Add support for PDF export
      // TODO: Add support for CSV export
      // TODO: Set appropriate headers and content type
      // TODO: Stream file to client

      res.status(501).json({
        success: false,
        message: 'Export functionality will be enabled later',
        features: ['Excel', 'PDF', 'CSV'],
      });
    } catch (error) {
      console.error('Error in exportReport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new ReportController();
