'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import adminUserApi, { User } from '@/lib/adminUserApi';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const result = await adminUserApi.getById(id);
      setUser(result.data);
      setError(null);
    } catch (err) {
      setError('Failed to load user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error || 'User not found'}
        </div>
        <Link href="/dashboard/admin/users" className="text-blue-600 hover:underline">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{user.fullName}</h1>
          <p className="text-gray-600 mt-2">{user.email}</p>
        </div>
        <Link
          href={`/dashboard/admin/users/${id}/edit`}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Edit User
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Details</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Full Name:</span>
              <p className="font-semibold">{user.fullName}</p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-semibold">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-semibold">{user.phone}</p>
              </div>
            )}
            <div>
              <span className="text-gray-600">Role:</span>
              <p className="font-semibold">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {user.role.replace(/_/g, ' ')}
                </span>
              </p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-semibold">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    user.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : user.status === 'SUSPENDED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Verification & Security</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email Verified:</span>
              <span className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                {user.emailVerified ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Phone Verified:</span>
              <span className={user.phoneVerified ? 'text-green-600' : 'text-red-600'}>
                {user.phoneVerified ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">MFA Enabled:</span>
              <span className={user.mfaEnabled ? 'text-green-600' : 'text-gray-600'}>
                {user.mfaEnabled ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <hr />
            <div>
              <span className="text-gray-600">Created:</span>
              <p className="font-semibold">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            {user.lastLoginAt && (
              <div>
                <span className="text-gray-600">Last Login:</span>
                <p className="font-semibold">
                  {new Date(user.lastLoginAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {user._count && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Account Activity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Properties</p>
                <p className="text-2xl font-bold text-blue-600">
                  {user._count.properties || 0}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Active Sessions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {user._count.sessions || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Link href="/dashboard/admin/users" className="text-blue-600 hover:underline">
        ← Back to Users
      </Link>
    </div>
  );
}
