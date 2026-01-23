'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import adminUserApi, { User } from '@/lib/adminUserApi';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await adminUserApi.getAll(
        page,
        10,
        search || undefined,
        roleFilter || undefined,
        statusFilter || undefined
      );
      setUsers(result.data.users);
      setTotalPages(result.data.pagination.pages);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await adminUserApi.delete(id);
      await loadUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-gray-600 mt-2">Manage all users in your system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="FLAT_OWNER">Flat Owner</option>
          <option value="TENANT">Tenant</option>
          <option value="MAINTENANCE_STAFF">Maintenance Staff</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <Link
          href="/dashboard/admin/users/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
        >
          Add User
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No users found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Phone</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Role</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Verified</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-semibold">
                    {user.fullName}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {user.email}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {user.phone || '-'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {user.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'SUSPENDED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {user.emailVerified ? '✓ Email' : '-'}
                    {user.phoneVerified ? ' ✓ Phone' : ''}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm space-x-2">
                    <Link
                      href={`/dashboard/admin/users/${user.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link
                      href={`/dashboard/admin/users/${user.id}/edit`}
                      className="text-green-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleDelete(user.id)}
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
