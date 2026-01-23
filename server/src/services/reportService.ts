import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportService {
  /**
   * Get monthly collection summary
   * Includes rent, maintenance, utilities breakdown
   */
  async getMonthlyCollectionSummary(startDate?: Date, endDate?: Date) {
    try {
      const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate || new Date();

      // Get current month invoices
      const currentMonthStart = new Date(end.getFullYear(), end.getMonth(), 1);
      const currentMonthEnd = new Date(end.getFullYear(), end.getMonth() + 1, 0);

      // FEATURE: Database aggregation - Will be optimized with better queries
      // TODO: Use database aggregation functions for better performance
      // TODO: Add indexing on relevant columns
      // TODO: Implement caching for frequently accessed reports

      const rentInvoices = await prisma.rentInvoice.findMany({
        where: {
          createdAt: { gte: start, lte: end },
        },
        include: { property: true, tenant: true },
      });

      const maintenanceInvoices = await prisma.maintenanceInvoice.findMany({
        where: {
          createdAt: { gte: start, lte: end },
        },
        include: { property: true },
      });

      // Calculate collection data
      const currentMonthRent = rentInvoices
        .filter(inv => inv.createdAt >= currentMonthStart && inv.createdAt <= currentMonthEnd)
        .reduce((sum, inv) => sum + inv.amount, 0);

      const currentMonthMaintenance = maintenanceInvoices
        .filter(inv => inv.createdAt >= currentMonthStart && inv.createdAt <= currentMonthEnd)
        .reduce((sum, inv) => sum + inv.amount, 0);

      const currentMonthTotal = currentMonthRent + currentMonthMaintenance;

      // Get payments for collection tracking
      const payments = await prisma.payment.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          status: 'SUCCESS',
        },
      });

      const currentMonthCollected = payments
        .filter(p => p.createdAt >= currentMonthStart && p.createdAt <= currentMonthEnd)
        .reduce((sum, p) => sum + p.amount, 0);

      const currentMonthPending = currentMonthTotal - currentMonthCollected;

      // Property-wise breakdown
      const propertyBreakdown = await this.getPropertyWiseCollection(start, end);

      // Monthly trend data
      const monthlyData = await this.getMonthlyTrend(start, end);

      return {
        currentMonth: {
          month: end.toLocaleString('default', { month: 'long', year: 'numeric' }),
          rent: currentMonthRent,
          maintenance: currentMonthMaintenance,
          utilities: 0, // Calculate if utilities are tracked
          total: currentMonthTotal,
          collected: currentMonthCollected,
          pending: currentMonthPending,
        },
        previousMonth: {
          month: new Date(end.getFullYear(), end.getMonth() - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
          rent: 0,
          maintenance: 0,
          utilities: 0,
          total: 0,
          collected: 0,
          pending: 0,
        },
        yearToDate: {
          month: `Year to Date`,
          rent: rentInvoices.reduce((sum, inv) => sum + inv.amount, 0),
          maintenance: maintenanceInvoices.reduce((sum, inv) => sum + inv.amount, 0),
          utilities: 0,
          total: currentMonthTotal,
          collected: payments.reduce((sum, p) => sum + p.amount, 0),
          pending: currentMonthTotal - payments.reduce((sum, p) => sum + p.amount, 0),
        },
        monthlyData,
        propertyBreakdown,
      };
    } catch (error) {
      console.error('Error in getMonthlyCollectionSummary:', error);
      throw new Error('Failed to generate monthly collection summary');
    }
  }

  /**
   * Get outstanding dues report
   */
  async getOutstandingDuesReport(sortBy: 'days' | 'amount' = 'days', property?: string) {
    try {
      const rentInvoices = await prisma.rentInvoice.findMany({
        where: {
          status: { not: 'PAID' },
        },
        include: { property: true, tenant: true },
      });

      const maintenanceInvoices = await prisma.maintenanceInvoice.findMany({
        where: {
          status: { not: 'PAID' },
        },
        include: { property: true },
      });

      // Get all outstanding invoices
      const allInvoices = [
        ...rentInvoices.map(inv => ({
          ...inv,
          type: 'rent',
          tenantName: inv.tenant?.fullName || 'Unknown',
          propertyName: inv.property?.name || 'Unknown',
        })),
        ...maintenanceInvoices.map(inv => ({
          ...inv,
          type: 'maintenance',
          tenantName: 'Property',
          propertyName: inv.property?.name || 'Unknown',
        })),
      ];

      // Calculate days overdue
      const now = new Date();
      const overdueDetails = allInvoices.map(inv => ({
        tenantName: inv.tenantName,
        property: inv.propertyName,
        invoiceNumber: (inv as any).invoiceNumber,
        amount: inv.amount,
        daysOverdue: Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
        dueDate: inv.dueDate,
        lastReminder: null,
      }));

      // Sort
      const sorted = overdueDetails.sort((a, b) =>
        sortBy === 'days' ? b.daysOverdue - a.daysOverdue : b.amount - a.amount
      );

      // Calculate aging buckets
      const current = overdueDetails.filter(d => d.daysOverdue <= 0).reduce((sum, d) => sum + d.amount, 0);
      const overdue1_7 = overdueDetails.filter(d => d.daysOverdue > 0 && d.daysOverdue <= 7).reduce((sum, d) => sum + d.amount, 0);
      const overdue8_30 = overdueDetails.filter(d => d.daysOverdue > 7 && d.daysOverdue <= 30).reduce((sum, d) => sum + d.amount, 0);
      const overdue30plus = overdueDetails.filter(d => d.daysOverdue > 30).reduce((sum, d) => sum + d.amount, 0);

      // Property-wise breakdown
      const propertyWise = new Map();
      overdueDetails.forEach(inv => {
        if (!propertyWise.has(inv.property)) {
          propertyWise.set(inv.property, { outstanding: 0, overdue: 0, count: 0 });
        }
        const data = propertyWise.get(inv.property);
        data.outstanding += inv.amount;
        if (inv.daysOverdue > 0) data.overdue += inv.amount;
        data.count += 1;
      });

      const totalOutstanding = allInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const totalOverdue = overdueDetails.filter(d => d.daysOverdue > 0).reduce((sum, d) => sum + d.amount, 0);

      return {
        totalOutstanding,
        totalOverdue,
        duesSummary: {
          current,
          overdue1_7,
          overdue8_30,
          overdue30plus,
        },
        overdueDetails: sorted,
        propertyWiseDues: Array.from(propertyWise.entries()).map(([property, data]) => ({
          property,
          ...data,
        })),
      };
    } catch (error) {
      console.error('Error in getOutstandingDuesReport:', error);
      throw new Error('Failed to generate outstanding dues report');
    }
  }

  /**
   * Get year-over-year comparison
   */
  async getYearOverYearComparison(year?: number) {
    try {
      const selectedYear = year || new Date().getFullYear();
      const previousYear = selectedYear - 1;

      // Get current year data
      const currentYearRent = await prisma.rentInvoice.aggregate({
        where: {
          createdAt: {
            gte: new Date(selectedYear, 0, 1),
            lte: new Date(selectedYear, 11, 31),
          },
          status: 'PAID',
        },
        _sum: { amount: true },
      });

      const previousYearRent = await prisma.rentInvoice.aggregate({
        where: {
          createdAt: {
            gte: new Date(previousYear, 0, 1),
            lte: new Date(previousYear, 11, 31),
          },
          status: 'PAID',
        },
        _sum: { amount: true },
      });

      const currentTotal = currentYearRent._sum?.amount || 0;
      const previousTotal = previousYearRent._sum?.amount || 0;

      const growthPercentage = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

      // Monthly comparison
      const monthlyComparison = [];
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(selectedYear, month, 1);
        const monthEnd = new Date(selectedYear, month + 1, 0);

        const currentMonthData = await prisma.rentInvoice.aggregate({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd },
            status: 'PAID',
          },
          _sum: { amount: true },
        });

        const previousMonthStart = new Date(previousYear, month, 1);
        const previousMonthEnd = new Date(previousYear, month + 1, 0);

        const previousMonthData = await prisma.rentInvoice.aggregate({
          where: {
            createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
            status: 'PAID',
          },
          _sum: { amount: true },
        });

        const currentMonthAmount = currentMonthData._sum?.amount || 0;
        const previousMonthAmount = previousMonthData._sum?.amount || 0;
        const change = currentMonthAmount - previousMonthAmount;
        const changePercent = previousMonthAmount > 0 ? (change / previousMonthAmount) * 100 : 0;

        monthlyComparison.push({
          month: new Date(selectedYear, month, 1).toLocaleString('default', { month: 'short' }),
          currentYear: currentMonthAmount,
          previousYear: previousMonthAmount,
          change,
          changePercent,
        });
      }

      // Find top and lowest months
      const topGrowthMonth = monthlyComparison.reduce((prev, current) =>
        prev.changePercent > current.changePercent ? prev : current
      );
      const lowestMonth = monthlyComparison.reduce((prev, current) =>
        prev.currentYear < current.currentYear ? prev : current
      );

      return {
        currentYear: currentTotal,
        previousYear: previousTotal,
        growthPercentage,
        yoyData: [],
        monthlyComparison,
        topGrowthMonth: topGrowthMonth.month,
        lowestMonth: lowestMonth.month,
      };
    } catch (error) {
      console.error('Error in getYearOverYearComparison:', error);
      throw new Error('Failed to generate year-over-year comparison');
    }
  }

  /**
   * Get cash flow statement
   */
  async getCashFlowStatement(months: number = 12) {
    try {
      const cashFlowData = [];
      let openingBalance = 0;

      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);

        // Get inflows
        const rentInflows = await prisma.rentInvoice.aggregate({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd },
            status: 'PAID',
          },
          _sum: { amount: true },
        });

        const maintenanceInflows = await prisma.maintenanceInvoice.aggregate({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd },
            status: 'PAID',
          },
          _sum: { amount: true },
        });

        // Get outflows (from payment records or expense tracking)
        const outflows = await prisma.payment.aggregate({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        });

        const totalInflows =
          (rentInflows._sum?.amount || 0) +
          (maintenanceInflows._sum?.amount || 0);
        const totalOutflows = outflows._sum?.amount || 0;
        const netCashFlow = totalInflows - totalOutflows;
        const closingBalance = openingBalance + netCashFlow;

        cashFlowData.push({
          month: monthStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
          openingBalance,
          inflows: {
            rent: rentInflows._sum?.amount || 0,
            maintenance: maintenanceInflows._sum?.amount || 0,
            utilities: 0,
            other: 0,
            total: totalInflows,
          },
          outflows: {
            maintenance: 0,
            staffCosts: 0,
            utilities: 0,
            vendorPayments: totalOutflows,
            other: 0,
            total: totalOutflows,
          },
          netCashFlow,
          closingBalance,
        });

        openingBalance = closingBalance;
      }

      const totalInflows = cashFlowData.reduce((sum, m) => sum + m.inflows.total, 0);
      const totalOutflows = cashFlowData.reduce((sum, m) => sum + m.outflows.total, 0);
      const netFlow = totalInflows - totalOutflows;

      return {
        totalInflows,
        totalOutflows,
        netCashFlow: netFlow,
        currentBalance: cashFlowData[cashFlowData.length - 1]?.closingBalance || 0,
        cashFlowData,
        topInflowCategory: { category: 'Rent', amount: totalInflows * 0.7 },
        topOutflowCategory: { category: 'Vendor Payments', amount: totalOutflows * 0.4 },
      };
    } catch (error) {
      console.error('Error in getCashFlowStatement:', error);
      throw new Error('Failed to generate cash flow statement');
    }
  }

  /**
   * Helper: Get property-wise collection
   */
  private async getPropertyWiseCollection(startDate: Date, endDate: Date) {
    const properties = await prisma.property.findMany({
      include: {
        rentInvoices: {
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
        },
        maintenanceInvoices: {
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
        },
      },
    });

    return properties.map(prop => ({
      property: prop.name,
      rent: prop.rentInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      maintenance: prop.maintenanceInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      utilities: 0,
      total: prop.rentInvoices.reduce((sum, inv) => sum + inv.amount, 0) +
             prop.maintenanceInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    }));
  }

  /**
   * Helper: Get monthly trend
   */
  private async getMonthlyTrend(startDate: Date, endDate: Date) {
    const months = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const monthStart = new Date(current);
      monthStart.setDate(1);

      const monthEnd = new Date(current);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);

      const rentData = await prisma.rentInvoice.aggregate({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      });

      const maintenanceData = await prisma.maintenanceInvoice.aggregate({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      });

      const paymentData = await prisma.payment.aggregate({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
          status: 'SUCCESS',
        },
        _sum: { amount: true },
      });

      const total = (rentData._sum?.amount || 0) + (maintenanceData._sum?.amount || 0);
      const collected = paymentData._sum?.amount || 0;

      months.push({
        month: current.toLocaleString('default', { month: 'short', year: '2-digit' }),
        invoices: 0,
        rent: rentData._sum?.amount || 0,
        maintenance: maintenanceData._sum?.amount || 0,
        utilities: 0,
        total,
        collected,
        pending: total - collected,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }
}

export default new ReportService();
