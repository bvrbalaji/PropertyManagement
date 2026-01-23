'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ownerApi from '@/lib/ownerApi';

interface Property {
  id: string;
  name: string;
  address: string;
  apartments: any[];
  financialData?: {
    rentalIncome: number;
    maintenanceFees: number;
    netIncome: number;
    totalTenants: number;
    occupancyRate: number;
  };
}

interface OwnerProfile {
  id: string;
  userId: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
  secondaryEmail?: string;
  secondaryPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  businessName?: string;
  profileCompleteness: number;
  verificationStatus: string;
  properties: any[];
}

interface FinancialSummary {
  totalProperties: number;
  totalRentalIncome: number;
  totalMaintenanceFees: number;
  totalNetIncome: number;
  totalTenants: number;
  averageOccupancyRate: number;
  properties: any[];
}

export default function OwnerDashboard() {
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'financial' | 'profile'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load profile, properties, and financial data in parallel
      const [profileRes, propertiesRes, financialRes] = await Promise.all([
        ownerApi.getProfile(),
        ownerApi.getProperties(),
        ownerApi.getFinancialSummary(),
      ]);

      if (profileRes.data?.success) {
        setOwnerProfile(profileRes.data.data);
      }

      if (propertiesRes.data?.success) {
        setProperties(propertiesRes.data.data.map((op: any) => op.property));
      }

      if (financialRes.data?.success) {
        setFinancialSummary(financialRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome, {ownerProfile?.user.fullName}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Profile {ownerProfile?.profileCompleteness}% Complete
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'properties', 'financial', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{properties.length}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Tenants</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{financialSummary?.totalTenants || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Monthly Income</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ₹{(financialSummary?.totalRentalIncome || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Avg. Occupancy</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{financialSummary?.averageOccupancyRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Verification Status</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ownership Verification</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">
                    {ownerProfile?.verificationStatus || 'Pending'}
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Update Documents
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
            {properties.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No properties added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{property.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{property.address}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">View Details</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600">Units</p>
                        <p className="text-lg font-bold text-gray-900">{property.apartments?.length || 0}</p>
                      </div>

                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600">Monthly Income</p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{(property.financialData?.rentalIncome || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600">Occupancy</p>
                        <p className="text-lg font-bold text-blue-600">{property.financialData?.occupancyRate.toFixed(0)}%</p>
                      </div>

                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600">Tenants</p>
                        <p className="text-lg font-bold text-gray-900">{property.financialData?.totalTenants || 0}</p>
                      </div>
                    </div>

                    <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      Ownership Documents
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Financial Summary</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Income</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ₹{(financialSummary?.totalRentalIncome || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  ₹{(financialSummary?.totalMaintenanceFees || 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Net Income</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ₹{(financialSummary?.totalNetIncome || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Property Financial Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Property-wise Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Income</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Expenses</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Net Income</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialSummary?.properties.map((prop: any) => (
                      <tr key={prop.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{prop.property?.name}</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{prop.rentalIncome.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-red-600 font-medium">₹{(prop.maintenanceFees + prop.propertyTax + prop.insurance).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-medium">₹{prop.netIncome.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{prop.occupancyRate.toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={ownerProfile?.user.fullName}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={ownerProfile?.user.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue={ownerProfile?.user.phone || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Emergency Contact</label>
                <input
                  type="text"
                  defaultValue={ownerProfile?.emergencyContactName || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">PAN Number</label>
                <input
                  type="text"
                  defaultValue={ownerProfile?.id || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                />
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
