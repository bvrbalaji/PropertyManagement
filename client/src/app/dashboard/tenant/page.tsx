'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function TenantDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/tenant');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tenant Dashboard</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">My Apartment</h2>
          {data?.apartment && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">{data.apartment.unitNumber}</h3>
              <p className="text-gray-600">{data.property?.name}</p>
              <p className="text-sm text-gray-500 mt-2">
                Owner: {data.owner?.fullName}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="block w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center font-medium">
              Request Maintenance
            </button>
            <button className="block w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center font-medium">
              Pay Rent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
