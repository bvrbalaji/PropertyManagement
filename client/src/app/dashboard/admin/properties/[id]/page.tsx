'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import adminPropertyApi, { Property } from '@/lib/adminPropertyApi';

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const result = await adminPropertyApi.getById(id);
      setProperty(result.data);
      setError(null);
    } catch (err) {
      setError('Failed to load property');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error || !property) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error || 'Property not found'}
        </div>
        <Link href="/dashboard/admin/properties" className="text-blue-600 hover:underline">
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <p className="text-gray-600 mt-2">{property.address}</p>
        </div>
        <Link
          href={`/dashboard/admin/properties/${id}/edit`}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Edit Property
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Property Details</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Property Name:</span>
              <p className="font-semibold">{property.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Address:</span>
              <p className="font-semibold">{property.address}</p>
            </div>
            <div>
              <span className="text-gray-600">Owner:</span>
              <p className="font-semibold">
                {property.owner?.fullName || 'Unassigned'}
              </p>
              {property.owner?.email && (
                <p className="text-sm text-gray-600">{property.owner.email}</p>
              )}
            </div>
            <div>
              <span className="text-gray-600">Created:</span>
              <p className="font-semibold">
                {new Date(property.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Total Apartments</p>
              <p className="text-2xl font-bold text-blue-600">
                {property._count?.apartments || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Active Leases</p>
              <p className="text-2xl font-bold text-green-600">
                {property._count?.tenantAssignments || 0}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Maintenance Requests</p>
              <p className="text-2xl font-bold text-orange-600">
                {property._count?.maintenanceRequests || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Occupancy Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {property._count?.apartments ? 
                  Math.round((property._count?.tenantAssignments || 0) / property._count?.apartments * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <Link href="/dashboard/admin/properties" className="text-blue-600 hover:underline">
        ← Back to Properties
      </Link>
    </div>
  );
}
