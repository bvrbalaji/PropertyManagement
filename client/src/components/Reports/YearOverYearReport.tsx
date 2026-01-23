'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import reportsApi, { YearOverYearComparison } from '@/lib/reportsApi';

interface YoyData {
  year: string;
  month: string;
  rentCollected: number;
  maintenanceCollected: number;
  utilitiesCollected: number;
  totalCollected: number;
  totalExpected: number;
}

interface YoyComparison {
  currentYear: number;
  previousYear: number;
  growthPercentage: number;
  yoyData: YoyData[];
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

export default function YearOverYearReport() {
  const [data, setData] = useState<YoyComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [selectedYear]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const year = selectedYear ? parseInt(selectedYear) : undefined;
      const reportData = await reportsApi.getYearOverYearComparison(year);
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
            <h1 className="text-3xl font-bold text-gray-900">Year-over-Year Comparison</h1>
            <p className="text-gray-600 mt-2">Financial performance analysis across years</p>
          </div>
          <Link href="/reports" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            ← Back to Reports
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Current Year</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              ₹{(data?.currentYear || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Previous Year</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{(data?.previousYear || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Growth Rate</p>
            <p className={`text-3xl font-bold mt-2 ${(data?.growthPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(data?.growthPercentage || 0).toFixed(2)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Absolute Change</p>
            <p className={`text-3xl font-bold mt-2 ${
              ((data?.currentYear || 0) - (data?.previousYear || 0)) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₹{Math.abs((data?.currentYear || 0) - (data?.previousYear || 0)).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="font-medium text-gray-900">Top Growth Month</p>
                  <p className="text-sm text-gray-600">{data?.topGrowthMonth || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📉</span>
                <div>
                  <p className="font-medium text-gray-900">Lowest Performance</p>
                  <p className="text-sm text-gray-600">{data?.lowestMonth || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium text-gray-900">Performance Status</p>
                  <p className="text-sm text-gray-600">
                    {(data?.growthPercentage || 0) > 10 ? 'Excellent Growth' :
                     (data?.growthPercentage || 0) > 0 ? 'Positive Growth' :
                     'Decline Observed'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
            <div className="space-y-3">
              {data?.monthlyComparison?.slice(0, 3).map((month, idx) => (
                <div key={idx} className={`border-l-4 pl-4 py-2 ${
                  month.change > 0 ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}>
                  <p className="font-medium text-gray-900">{month.month}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold ${month.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {month.change > 0 ? '+' : ''}{month.changePercent.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-600">
                      Current: ₹{month.currentYear.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Comparison Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Current Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Previous Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Change</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Change %</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data?.monthlyComparison?.map((month, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{month.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{month.currentYear.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{month.previousYear.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${month.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {month.change > 0 ? '+' : ''}₹{month.change.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                        month.changePercent > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {month.changePercent > 0 ? '+' : ''}{month.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {month.changePercent > 5 ? '📈' : month.changePercent < -5 ? '📉' : '➡️'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FEATURE: YoY Charts - Will be enabled later */}
        {/* TODO: Implement line chart for trend visualization */}
        {/* TODO: Add bar chart for monthly comparison */}
        {/* TODO: Add growth rate indicators */}

        {/* Analysis Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Analysis Tips</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Positive growth indicates improving collection rates</li>
            <li>• Seasonal patterns may affect certain months</li>
            <li>• Compare same months across years for accurate analysis</li>
            <li>• Investigate sharp declines or unexpected spikes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
