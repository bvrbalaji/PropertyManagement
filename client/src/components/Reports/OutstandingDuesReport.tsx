'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface DuesData {
  tenantName: string;
  property: string;
  invoiceNumber: string;
  amount: number;
  daysOverdue: number;
  dueDate: string;
  lastReminder: string | null;
}

interface OutstandingDuesSummary {
  totalOutstanding: number;
  totalOverdue: number;
  duesSummary: {
    current: number;
    overdue1_7: number;
    overdue8_30: number;
    overdue30plus: number;
  };
  overdueDetails: DuesData[];
  propertyWiseDues: Array<{
    property: string;
    outstanding: number;
    overdue: number;
    count: number;
  }>;
}

export default function OutstandingDuesReport() {
  const [data, setData] = useState<OutstandingDuesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'days' | 'amount'>('days');
  const [filterProperty, setFilterProperty] = useState('ALL');

  useEffect(() => {
    fetchReportData();
  }, [sortBy, filterProperty]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('sortBy', sortBy);
      if (filterProperty !== 'ALL') params.append('property', filterProperty);

      const response = await fetch(`/api/reports/outstanding-dues?${params}`);
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (invoiceNumber: string) => {
    try {
      // FEATURE: Send Payment Reminder - Will be enabled later
      // TODO: Integrate with email service
      // TODO: Log reminder sent timestamp
      // TODO: Track multiple reminders per invoice
      toast.success('Reminder sent to tenant');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const handleExportReport = () => {
    try {
      // FEATURE: Export Overdue Report - Will be enabled later
      // TODO: Generate Excel with overdue details
      // TODO: Include aging analysis
      // TODO: Add recovery recommendations
      toast.success('Exporting report...');
    } catch (error) {
      toast.error('Failed to export report');
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
            <h1 className="text-3xl font-bold text-gray-900">Outstanding Dues Report</h1>
            <p className="text-gray-600 mt-2">Pending payments and overdue invoices analysis</p>
          </div>
          <Link href="/reports" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            ← Back to Reports
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Outstanding</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">₹{(data?.totalOutstanding || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Overdue</p>
            <p className="text-3xl font-bold text-red-600 mt-2">₹{(data?.totalOverdue || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">1-7 Days</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">₹{(data?.duesSummary?.overdue1_7 || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">30+ Days</p>
            <p className="text-3xl font-bold text-red-700 mt-2">₹{(data?.duesSummary?.overdue30plus || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Aging Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dues Aging Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-900">Current (Not Due)</span>
                <span className="text-lg font-bold text-green-600">₹{(data?.duesSummary?.current || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-sm font-medium text-yellow-900">1-7 Days Overdue</span>
                <span className="text-lg font-bold text-yellow-600">₹{(data?.duesSummary?.overdue1_7 || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="text-sm font-medium text-orange-900">8-30 Days Overdue</span>
                <span className="text-lg font-bold text-orange-600">₹{(data?.duesSummary?.overdue8_30 || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm font-medium text-red-900">30+ Days Overdue</span>
                <span className="text-lg font-bold text-red-600">₹{(data?.duesSummary?.overdue30plus || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property-wise Outstanding</h3>
            <div className="space-y-3">
              {data?.propertyWiseDues?.map((prop, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{prop.property}</h4>
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">{prop.count} invoices</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Outstanding: <span className="font-bold text-blue-600">₹{prop.outstanding.toLocaleString()}</span></div>
                    <div>Overdue: <span className="font-bold text-red-600">₹{prop.overdue.toLocaleString()}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters & Export */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Properties</option>
                {data?.propertyWiseDues?.map((prop) => (
                  <option key={prop.property} value={prop.property}>{prop.property}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'days' | 'amount')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="days">Days Overdue</option>
                <option value="amount">Amount</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleExportReport}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Overdue Invoices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Overdue Invoices</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tenant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Days Overdue</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Reminder</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.overdueDetails?.length ? (
                  data.overdueDetails.map((invoice, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{invoice.tenantName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{invoice.property}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{invoice.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          invoice.daysOverdue > 30 ? 'bg-red-100 text-red-800' :
                          invoice.daysOverdue > 7 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.daysOverdue} days
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {invoice.lastReminder ? new Date(invoice.lastReminder).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleSendReminder(invoice.invoiceNumber)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No overdue invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recovery Recommendations */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Recovery Recommendations</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Prioritize invoices overdue by 30+ days for immediate follow-up</li>
            <li>• Send personalized reminders for invoices overdue by 7+ days</li>
            <li>• Consider late fees for outstanding amounts</li>
            <li>• Track payment patterns to identify chronic late payers</li>
            <li>• Escalate cases for collection after 60 days without payment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
