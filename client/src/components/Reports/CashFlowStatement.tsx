'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import reportsApi, { CashFlowStatement } from '@/lib/reportsApi';

interface CashFlowData {
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
}

interface CashFlowStatement {
  totalInflows: number;
  totalOutflows: number;
  netCashFlow: number;
  currentBalance: number;
  cashFlowData: CashFlowData[];
  topInflowCategory: { category: string; amount: number };
  topOutflowCategory: { category: string; amount: number };
}

export default function CashFlowStatement() {
  const [data, setData] = useState<CashFlowStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('12');

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const reportData = await reportsApi.getCashFlow(parseInt(period));
      setData(reportData);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cash Flow Statement</h1>
            <p className="text-gray-600 mt-2">Money in and out analysis for informed financial planning</p>
          </div>
          <Link href="/reports" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            ← Back to Reports
          </Link>
        </div>

        {/* Period Selection */}
        <div className="mb-6 flex gap-2">
          {['3', '6', '12'].map((months) => (
            <button
              key={months}
              onClick={() => setPeriod(months)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === months
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {months === '3' ? 'Last 3 Months' : months === '6' ? 'Last 6 Months' : 'Last 12 Months'}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Inflows</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₹{(data?.totalInflows || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Outflows</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              ₹{(data?.totalOutflows || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Net Cash Flow</p>
            <p className={`text-3xl font-bold mt-2 ${(data?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(data?.netCashFlow || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Current Balance</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              ₹{(data?.currentBalance || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Inflows & Outflows Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inflow Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium">Rent Collection</span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{(data?.cashFlowData?.[0]?.inflows?.rent || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium">Maintenance Charges</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{(data?.cashFlowData?.[0]?.inflows?.maintenance || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-sm font-medium">Utilities</span>
                <span className="text-lg font-bold text-yellow-600">
                  ₹{(data?.cashFlowData?.[0]?.inflows?.utilities || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-sm font-medium">Other Income</span>
                <span className="text-lg font-bold text-purple-600">
                  ₹{(data?.cashFlowData?.[0]?.inflows?.other || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Outflow Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm font-medium">Maintenance Costs</span>
                <span className="text-lg font-bold text-red-600">
                  ₹{(data?.cashFlowData?.[0]?.outflows?.maintenance || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="text-sm font-medium">Staff Costs</span>
                <span className="text-lg font-bold text-orange-600">
                  ₹{(data?.cashFlowData?.[0]?.outflows?.staffCosts || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-sm font-medium">Utilities</span>
                <span className="text-lg font-bold text-yellow-600">
                  ₹{(data?.cashFlowData?.[0]?.outflows?.utilities || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium">Vendor Payments</span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{(data?.cashFlowData?.[0]?.outflows?.vendorPayments || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Cash Flow Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Cash Flow Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Opening</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Inflows</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Outflows</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Net Flow</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Closing</th>
                </tr>
              </thead>
              <tbody>
                {data?.cashFlowData?.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{row.openingBalance.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">₹{row.inflows.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600">₹{row.outflows.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                        row.netCashFlow > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {row.netCashFlow > 0 ? '+' : ''}₹{row.netCashFlow.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">₹{row.closingBalance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FEATURE: Cash Flow Charts - Will be enabled later */}
        {/* TODO: Implement waterfall chart for cash flow visualization */}
        {/* TODO: Add trend lines for inflows and outflows */}
        {/* TODO: Create pie charts for component breakdown */}

        {/* Financial Health Indicator */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Health Indicator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Inflow vs Outflow Ratio</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((data?.totalInflows || 1) / Math.max(data?.totalOutflows || 1, 1)) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Healthy if ratio &gt; 1.0 (more coming in than going out)
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">Status</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                {(data?.totalInflows || 0) > (data?.totalOutflows || 0) ? '✓ Positive Flow' : '⚠ Negative Flow'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
