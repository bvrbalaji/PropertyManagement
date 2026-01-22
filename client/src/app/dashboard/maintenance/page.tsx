'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function MaintenanceDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/maintenance');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Maintenance Staff Dashboard</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {data?.pendingRequests?.map((request: any) => (
              <div key={request.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold">{request.title}</h3>
                <p className="text-gray-600">{request.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Requested by: {request.tenant?.fullName}
                </p>
                <span className={`inline-block mt-2 px-3 py-1 rounded text-sm font-medium ${
                  request.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  Priority: {request.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <button className="block w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center font-medium">
            View All Requests
          </button>
        </div>
      </div>
    </div>
  );
}
