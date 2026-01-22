'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function FlatOwnerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/flat-owner');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Flat Owner Dashboard</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">My Properties</h2>
          <div className="space-y-4">
            {data?.properties?.map((property: any) => (
              <div key={property.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold">{property.name}</h3>
                <p className="text-gray-600">{property.address}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {property.apartments?.length || 0} apartments
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="block w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center font-medium">
              View Maintenance Requests
            </button>
            <button className="block w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center font-medium">
              View Payments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
