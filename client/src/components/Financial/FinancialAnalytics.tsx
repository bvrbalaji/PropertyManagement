'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface ChartData {
  month: string;
  invoices: number;
  payments: number;
  pending: number;
  revenue: number;
}

interface AnalyticsData {
  collectionRate: number;
  averagePaymentTime: number;
  overduePercentage: number;
  monthlyTrend: ChartData[];
  topProperties: Array<{ name: string; revenue: number; invoices: number }>;
  paymentMethodBreakdown: Array<{ method: string; count: number; percentage: number }>;
}

export default function FinancialAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/finances/analytics?days=${dateRange}`);
      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
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
            <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
            <p className="text-gray-600 mt-2">View financial metrics, trends, and performance</p>
          </div>
          <Link href="/finances" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 flex gap-4">
          {['7', '30', '90', '365'].map((days) => (
            <button
              key={days}
              onClick={() => setDateRange(days)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {days === '7' ? 'Last 7 Days' : days === '30' ? 'Last 30 Days' : days === '90' ? 'Last 90 Days' : 'Last Year'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Collection Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{(analytics?.collectionRate || 0).toFixed(1)}%</p>
            <p className="text-xs text-gray-600 mt-2">Percentage of invoices paid</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Avg Payment Time</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{Math.round(analytics?.averagePaymentTime || 0)} days</p>
            <p className="text-xs text-gray-600 mt-2">Average days to payment</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Overdue Rate</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{(analytics?.overduePercentage || 0).toFixed(1)}%</p>
            <p className="text-xs text-gray-600 mt-2">Percentage overdue</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Expected Impact</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {(analytics?.collectionRate || 0) > 90 ? '✓ Good' : (analytics?.collectionRate || 0) > 70 ? '⚠ Fair' : '✗ Poor'}
            </p>
            <p className="text-xs text-gray-600 mt-2">Based on collection metrics</p>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Invoices</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Payments</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Pending</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.monthlyTrend?.map((data, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{data.month}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{data.invoices}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">{data.payments}</td>
                    <td className="px-4 py-3 text-sm text-orange-600 font-medium">{data.pending}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{data.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Properties */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Properties by Revenue</h3>
            <div className="space-y-4">
              {analytics?.topProperties?.map((property, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{property.name}</h4>
                    <span className="text-sm font-medium text-blue-600">{property.invoices} invoices</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (property.revenue /
                            Math.max(...(analytics?.topProperties?.map((p) => p.revenue) || [1]))) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Revenue: ₹{property.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Breakdown</h3>
            <div className="space-y-4">
              {analytics?.paymentMethodBreakdown?.map((method, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{method.method}</h4>
                    <span className="text-sm font-medium text-blue-600">{method.count} payments</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{method.percentage}% of total payments</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
          <div className="flex gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
              Export as CSV
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
              Export as PDF
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
