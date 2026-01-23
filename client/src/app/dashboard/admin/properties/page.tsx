'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import adminPropertyApi, { Property } from '@/lib/adminPropertyApi';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadProperties();
  }, [page, search]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const result = await adminPropertyApi.getAll(page, 10, search || undefined);
      setProperties(result.data.properties);
      setTotalPages(result.data.pagination.pages);
      setError(null);
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await adminPropertyApi.delete(id);
      await loadProperties();
    } catch (err) {
      setError('Failed to delete property');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (loading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Properties Management</h1>
        <p className="text-gray-600 mt-2">Manage all properties in your system</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex-1 mr-4">
          <input
            type="text"
            placeholder="Search by name or address..."
            value={search}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Link
          href="/dashboard/admin/properties/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Property
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No properties found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Address</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Owner</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Apartments</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Active Leases</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-semibold">
                    {property.name}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {property.address}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {property.owner?.fullName || 'Unassigned'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    {property._count?.apartments || 0}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    {property._count?.tenantAssignments || 0}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm space-x-2">
                    <Link
                      href={`/dashboard/admin/properties/${property.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link
                      href={`/dashboard/admin/properties/${property.id}/edit`}
                      className="text-green-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
