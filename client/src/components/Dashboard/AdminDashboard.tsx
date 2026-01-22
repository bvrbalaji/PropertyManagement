'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalProperties: number;
    activeSessions: number;
  };
  properties: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/admin');
        setData(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{data?.stats.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Properties</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{data?.stats.totalProperties || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{data?.stats.activeSessions || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/users"
              className="block w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center font-medium"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/properties"
              className="block w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center font-medium"
            >
              Manage Properties
            </Link>
            <Link
              href="/admin/reports"
              className="block w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center font-medium"
            >
              View Reports
            </Link>
          </div>
        </div>

        {/* Session Timeout */}
        <div className="text-center text-sm text-gray-500">
          Session expires in: 30 minutes
        </div>
      </div>
    </div>
  );
}
