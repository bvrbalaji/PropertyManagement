import api from './api';

export interface MonthlyCollectionSummary {
  currentMonth: {
    month: string;
    rent: number;
    maintenance: number;
    utilities: number;
    total: number;
    collected: number;
    pending: number;
  };
  previousMonth: {
    month: string;
    rent: number;
    maintenance: number;
    utilities: number;
    total: number;
    collected: number;
    pending: number;
  };
  yearToDate: {
    month: string;
    rent: number;
    maintenance: number;
    utilities: number;
    total: number;
    collected: number;
    pending: number;
  };
  monthlyData: Array<{
    month: string;
    invoices: number;
    rent: number;
    maintenance: number;
    utilities: number;
    total: number;
    collected: number;
    pending: number;
  }>;
  propertyBreakdown: Array<{
    property: string;
    rent: number;
    maintenance: number;
    utilities: number;
    total: number;
  }>;
}

export interface OutstandingDuesDetail {
  tenantName: string;
  property: string;
  invoiceNumber: string;
  amount: number;
  daysOverdue: number;
  dueDate: Date;
  lastReminder: null | Date;
}

export interface OutstandingDuesReport {
  totalOutstanding: number;
  totalOverdue: number;
  duesSummary: {
    current: number;
    overdue1_7: number;
    overdue8_30: number;
    overdue30plus: number;
  };
  overdueDetails: OutstandingDuesDetail[];
  propertyWiseDues: Array<{
    property: string;
    outstanding: number;
    overdue: number;
    count: number;
  }>;
}

export interface YearOverYearComparison {
  currentYear: number;
  previousYear: number;
  growthPercentage: number;
  yoyData: any[];
  monthlyComparison: Array<{
    month: string;
    currentYear: number;
    previousYear: number;
    change: number;
    changePercent: number;
  }>;
  topGrowthMonth: string;
  lowestMonth: string;
}

export interface CashFlowStatement {
  totalInflows: number;
  totalOutflows: number;
  netCashFlow: number;
  currentBalance: number;
  cashFlowData: Array<{
    month: string;
    openingBalance: number;
    inflows: {
      rent: number;
      maintenance: number;
      utilities: number;
      other: number;
      total: number;
    };
    outflows: {
      maintenance: number;
      staffCosts: number;
      utilities: number;
      vendorPayments: number;
      other: number;
      total: number;
    };
    netCashFlow: number;
    closingBalance: number;
  }>;
  topInflowCategory: { category: string; amount: number };
  topOutflowCategory: { category: string; amount: number };
}

export interface FinancialHealth {
  healthScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  metrics: {
    overduePercentage: number;
    netCashFlow: number;
    currentBalance: number;
    totalOutstanding: number;
  };
}

class ReportsAPI {
  /**
   * Get monthly collection summary
   */
  async getCollectionSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<MonthlyCollectionSummary> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await api.get(`/reports/collection-summary?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching collection summary:', error);
      throw error;
    }
  }

  /**
   * Get outstanding dues report
   */
  async getOutstandingDues(
    sortBy: 'days' | 'amount' = 'days',
    propertyId?: string
  ): Promise<OutstandingDuesReport> {
    try {
      const params = new URLSearchParams();
      params.append('sortBy', sortBy);
      if (propertyId) params.append('propertyId', propertyId);

      const response = await api.get(`/reports/outstanding-dues?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching outstanding dues:', error);
      throw error;
    }
  }

  /**
   * Get year-over-year comparison
   */
  async getYearOverYearComparison(year?: number): Promise<YearOverYearComparison> {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());

      const response = await api.get(`/reports/yoy-comparison?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching year-over-year comparison:', error);
      throw error;
    }
  }

  /**
   * Get cash flow statement
   */
  async getCashFlow(months: number = 12): Promise<CashFlowStatement> {
    try {
      const params = new URLSearchParams();
      params.append('months', months.toString());

      const response = await api.get(`/reports/cash-flow?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching cash flow:', error);
      throw error;
    }
  }

  /**
   * Get financial health status
   */
  async getFinancialHealth(): Promise<FinancialHealth> {
    try {
      const response = await api.get('/reports/health');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching financial health:', error);
      throw error;
    }
  }

  /**
   * Export report (feature coming soon)
   */
  async exportReport(
    reportType: 'collection' | 'dues' | 'yoy' | 'cashflow',
    format: 'excel' | 'pdf' | 'csv'
  ): Promise<void> {
    try {
      const response = await api.post('/reports/export', {
        reportType,
        format,
      });

      // TODO: Handle file download when export functionality is implemented
      // TODO: Create blob and trigger download
      // TODO: Show success/error toast

      console.log('Export initiated:', response.data);
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
}

export default new ReportsAPI();
