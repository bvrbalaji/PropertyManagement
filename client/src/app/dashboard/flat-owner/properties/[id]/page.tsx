'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface PropertyDetail {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

interface Unit {
  id: string;
  unitNumber: string;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

interface Tenant {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  startDate: string;
  endDate?: string;
}

interface PropertyFinancial {
  totalRent: number;
  totalMaintenance: number;
  totalPayments: number;
  pending: number;
}

export default function OwnerPropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [financials, setFinancials] = useState<PropertyFinancial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'tenants' | 'financials'>('overview');

  useEffect(() => {
    loadPropertyData();
  }, [propertyId]);

  const loadPropertyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [propRes, unitsRes, tenantsRes, finRes] = await Promise.all([
        api.get(`/owner/properties/${propertyId}`),
        api.get(`/owner/properties/${propertyId}/units`),
        api.get(`/owner/properties/${propertyId}/tenants`),
        api.get(`/owner/properties/${propertyId}/financials`),
      ]);

      setProperty(propRes.data.data);
      setUnits(unitsRes.data.data || []);
      setTenants(tenantsRes.data.data || []);
      setFinancials(finRes.data.data);
    } catch (err) {
      setError('Failed to load property details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading property details...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error || 'Property not found'}
        </div>
        <Link href="/dashboard/flat-owner" className="text-blue-600 hover:underline">
          Back to Dashboard
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
          href={`/dashboard/flat-owner/properties/${propertyId}/edit`}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Edit Property
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {(['overview', 'units', 'tenants', 'financials'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Property Information</h2>
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
                <span className="text-gray-600">Created:</span>
                <p className="font-semibold">
                  {new Date(property.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Total Units</p>
                <p className="text-2xl font-bold text-blue-600">{units.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Occupied Units</p>
                <p className="text-2xl font-bold text-green-600">{tenants.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Units Tab */}
      {activeTab === 'units' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Property Units</h2>
          {units.length === 0 ? (
            <p className="text-gray-500">No units found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left">Unit Number</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Floor</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Bedrooms</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Bathrooms</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Area (sq ft)</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 font-semibold">
                        {unit.unitNumber}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">{unit.floor || '-'}</td>
                      <td className="border border-gray-200 px-4 py-2">{unit.bedrooms || '-'}</td>
                      <td className="border border-gray-200 px-4 py-2">{unit.bathrooms || '-'}</td>
                      <td className="border border-gray-200 px-4 py-2">{unit.area || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tenants Tab */}
      {activeTab === 'tenants' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Tenants</h2>
          {tenants.length === 0 ? (
            <p className="text-gray-500">No tenants found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Phone</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Start Date</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 font-semibold">
                        {tenant.fullName}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">{tenant.email}</td>
                      <td className="border border-gray-200 px-4 py-2">{tenant.phone || '-'}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        {new Date(tenant.startDate).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {tenant.endDate ? new Date(tenant.endDate).toLocaleDateString() : 'Ongoing'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Financials Tab */}
      {activeTab === 'financials' && financials && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Rent:</span>
                <span className="font-semibold">${financials.totalRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maintenance Fees:</span>
                <span className="font-semibold">
                  ${financials.totalMaintenance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Payments:</span>
                <span className="font-semibold text-green-600">
                  ${financials.totalPayments.toLocaleString()}
                </span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-red-600">
                  ${financials.pending.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Link href="/dashboard/flat-owner" className="text-blue-600 hover:underline">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
