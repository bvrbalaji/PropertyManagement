'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface CollectionData {
  month: string;
  rent: number;
  maintenance: number;
  utilities: number;
  total: number;
  collected: number;
  pending: number;
}

interface CollectionSummary {
  currentMonth: CollectionData;
  previousMonth: CollectionData;
  yearToDate: CollectionData;
  monthlyData: CollectionData[];
  propertyBreakdown: Array<{
    property: string;
    rent: number;
    maintenance: number;
    utilities: number;
    total: number;
  }>;
}

export default function MonthlyCollectionReport() {
  const [data, setData] = useState<CollectionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewType, setViewType] = useState<'monthly' | 'property'>('monthly');

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/reports/collection-summary?${params}`);
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      // FEATURE: Excel Export Functionality - Will be enabled later
      // TODO: Implement xlsx library integration
      // TODO: Format data with proper headers and styling
      // TODO: Generate downloadable Excel file with multiple sheets
      toast.success('Exporting to Excel...');
      // const workbook = XLSX.utils.book_new();
      // Add data processing and download
    } catch (error) {
      toast.error('Failed to export to Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      // FEATURE: PDF Export Functionality - Will be enabled later
      // TODO: Implement PDF generation library (jsPDF, pdfkit)
      // TODO: Add charts and formatted tables
      // TODO: Include company header and footer
      toast.success('Exporting to PDF...');
    } catch (error) {
      toast.error('Failed to export to PDF');
    }
  };

  const handleExportCSV = () => {
    try {
      // FEATURE: CSV Export Functionality - Will be enabled later
      // TODO: Convert data to CSV format
      // TODO: Generate downloadable CSV file
      toast.success('Exporting to CSV...');
    } catch (error) {
      toast.error('Failed to export to CSV');
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
            <h1 className="text-3xl font-bold text-gray-900">Monthly Collection Summary</h1>
            <p className="text-gray-600 mt-2">Rent, maintenance, and utilities collection report</p>
          </div>
          <Link href="/reports" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            ← Back to Reports
          </Link>
        </div>

        {/* Date Range & Export */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Type</label>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value as 'monthly' | 'property')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly Breakdown</option>
                <option value="property">Property-wise</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReportData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleExportExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1H3z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2 1 1 0 000 2h12a1 1 0 000-2 2 2 0 00-2 2v10a2 2 0 002 2H5a2 2 0 01-2-2V5z" clipRule="evenodd" />
              </svg>
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V6a1 1 0 00-1-1h3a1 1 0 000-2 2 2 0 00-2 2H4z" clipRule="evenodd" />
              </svg>
              Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Collected</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₹{(data?.currentMonth?.collected || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-2">This month</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Expected</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              ₹{(data?.currentMonth?.total || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-2">This month</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Pending Amount</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              ₹{(data?.currentMonth?.pending || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-2">Awaiting collection</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Collection Rate</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {data?.currentMonth?.total ? 
                ((data.currentMonth.collected / data.currentMonth.total) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-600 mt-2">Success rate</p>
          </div>
        </div>

        {/* Breakdown Table */}
        {viewType === 'monthly' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rent</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Maintenance</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Utilities</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Collected</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.monthlyData?.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.month}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">₹{row.rent.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">₹{row.maintenance.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">₹{row.utilities.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{row.total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">₹{row.collected.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-orange-600">₹{row.pending.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Property-wise Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rent</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Maintenance</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Utilities</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.propertyBreakdown?.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.property}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">₹{row.rent.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">₹{row.maintenance.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">₹{row.utilities.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FEATURE: Visualization Charts - Will be enabled later */}
        {/* TODO: Implement Chart.js or Recharts for visualizations */}
        {/* TODO: Add pie charts for collection breakdown */}
        {/* TODO: Add bar charts for monthly trends */}
        {/* TODO: Add line charts for year-over-year comparison */}
      </div>
    </div>
  );
}
