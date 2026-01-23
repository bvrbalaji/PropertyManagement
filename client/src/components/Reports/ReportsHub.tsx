'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import reportsApi, { FinancialHealth } from '@/lib/reportsApi';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'collection-summary',
    name: 'Monthly Collection Summary',
    description: 'Rent, maintenance, utilities collection report',
    icon: '📊',
    color: 'blue',
  },
  {
    id: 'outstanding-dues',
    name: 'Outstanding Dues Report',
    description: 'Pending payments and overdue invoices',
    icon: '⏰',
    color: 'red',
  },
  {
    id: 'vendor-payments',
    name: 'Vendor Payment Reports',
    description: 'Payments made to vendors and contractors',
    icon: '🏢',
    color: 'purple',
  },
  {
    id: 'yoy-comparison',
    name: 'Year-over-Year Comparison',
    description: 'Financial performance across years',
    icon: '📈',
    color: 'green',
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow Statement',
    description: 'Money in and out analysis',
    icon: '💰',
    color: 'yellow',
  },
  {
    id: 'budget-actual',
    name: 'Budget vs. Actual Tracking',
    description: 'Planned vs. actual expenses',
    icon: '💼',
    color: 'indigo',
  },
];

export default function ReportsHub() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<FinancialHealth | null>(null);

  useEffect(() => {
    loadFinancialHealth();
  }, []);

  const loadFinancialHealth = async () => {
    try {
      const healthData = await reportsApi.getFinancialHealth();
      setHealth(healthData);
    } catch (error) {
      console.error('Error loading financial health:', error);
      toast.error('Failed to load financial health status');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId);
    // Navigate to specific report
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string } } = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">Generate comprehensive financial reports with visual insights</p>
          </div>
          <Link href="/finances" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Reports Available</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{REPORT_TYPES.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Export Formats</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
            <p className="text-xs text-gray-600 mt-1">Excel • PDF • CSV</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Data Accuracy</p>
            <p className="text-3xl font-bold text-green-600 mt-2">99.9%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Gen Time</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">&lt;30s</p>
          </div>
        </div>

        {/* Reports Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPORT_TYPES.map((report) => {
              const colors = getColorClasses(report.color);
              return (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className={`${colors.bg} border-2 ${colors.border} rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{report.icon}</div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Custom Report
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Schedule Reports
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Audit Trail
            </button>
          </div>
        </div>

        {/* Report Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Report Tips</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Use date range filters to compare specific periods</li>
            <li>• Export reports for offline analysis and presentations</li>
            <li>• Property-wise breakdowns help identify high/low performers</li>
            <li>• Budget vs. actual reports help optimize expenses</li>
            <li>• Year-over-year comparisons track growth trends</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
