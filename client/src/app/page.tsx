'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUserRole } from '@/lib/auth';
import Cookies from 'js-cookie';

type UserRole = 'ADMIN' | 'FLAT_OWNER' | 'TENANT' | 'MAINTENANCE_STAFF' | null;

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  href: string;
  roles: UserRole[];
}

export default function Home() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = getUserRole();
    const token = Cookies.get('accessToken');
    
    if (token && role) {
      setUserRole(role);
      setIsLoggedIn(true);
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setUserName(userData.fullName || userData.email);
        } catch (e) {
          setUserName(role);
        }
      }
    }
    setLoading(false);
  }, []);

  const features: FeatureCard[] = [
    {
      title: 'User Management',
      description: 'Manage all users, roles, and permissions in the system',
      icon: '👥',
      href: '/dashboard/admin',
      roles: ['ADMIN'],
    },
    {
      title: 'Financial Reports',
      description: 'View comprehensive financial analysis and reports',
      icon: '📊',
      href: '/reports',
      roles: ['ADMIN', 'FLAT_OWNER'],
    },
    {
      title: 'Property Management',
      description: 'Manage properties, units, and occupancy',
      icon: '🏢',
      href: '/dashboard/admin',
      roles: ['ADMIN', 'FLAT_OWNER'],
    },
    {
      title: 'Maintenance Requests',
      description: 'View and manage maintenance requests across properties',
      icon: '🔧',
      href: '/dashboard/maintenance',
      roles: ['ADMIN', 'MAINTENANCE_STAFF'],
    },
    {
      title: 'Owner Dashboard',
      description: 'Manage your properties, tenants, and financials',
      icon: '🏠',
      href: '/dashboard/flat-owner',
      roles: ['FLAT_OWNER'],
    },
    {
      title: 'Tenant Onboarding',
      description: 'Handle tenant onboarding and offboarding processes',
      icon: '📋',
      href: '/dashboard/flat-owner',
      roles: ['FLAT_OWNER'],
    },
    {
      title: 'Tenant Dashboard',
      description: 'View your lease, pay rent, and submit maintenance requests',
      icon: '📄',
      href: '/dashboard/tenant',
      roles: ['TENANT'],
    },
    {
      title: 'Rent Payment',
      description: 'Pay your rent and track payment history',
      icon: '💰',
      href: '/dashboard/tenant',
      roles: ['TENANT'],
    },
    {
      title: 'Maintenance Dashboard',
      description: 'View and manage assigned maintenance tasks',
      icon: '🛠️',
      href: '/dashboard/maintenance',
      roles: ['MAINTENANCE_STAFF'],
    },
  ];

  const roleDescriptions: Record<string, string> = {
    ADMIN: 'System Administrator',
    FLAT_OWNER: 'Flat/Property Owner',
    TENANT: 'Tenant',
    MAINTENANCE_STAFF: 'Maintenance Staff',
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    FLAT_OWNER: 'bg-blue-100 text-blue-800',
    TENANT: 'bg-green-100 text-green-800',
    MAINTENANCE_STAFF: 'bg-yellow-100 text-yellow-800',
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              🏢 Property Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Complete solution for managing properties, tenants, and maintenance
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-blue-600"
              >
                Register
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              { icon: '👥', title: 'Multi-Role Support', desc: 'Admin, Owner, Tenant & Staff' },
              { icon: '🔐', title: 'Secure Auth', desc: 'JWT & MFA Protection' },
              { icon: '📊', title: 'Analytics', desc: 'Financial Reports & Insights' },
              { icon: '🔔', title: 'Notifications', desc: 'Multi-channel Alerts' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-4xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const userFeatures = features.filter(f => f.roles.includes(userRole));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-gray-600 mt-1">{userName}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${roleColors[userRole!]}`}>
                {roleDescriptions[userRole!]}
              </span>
              <Link
                href="/login"
                onClick={() => {
                  Cookies.remove('accessToken');
                  Cookies.remove('refreshToken');
                  Cookies.remove('userRole');
                  localStorage.removeItem('userData');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userFeatures.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <span className="text-blue-600 font-medium group-hover:text-blue-700">
                  Access →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Role: {roleDescriptions[userRole!]}</h2>
          
          {userRole === 'ADMIN' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Admin Capabilities:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Manage all users and roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Access comprehensive reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Monitor all properties and tenants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">View financial analytics</span>
                </li>
              </ul>
            </div>
          )}

          {userRole === 'FLAT_OWNER' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Owner Capabilities:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Manage your properties</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Handle tenant onboarding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">View financial reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Track rental income</span>
                </li>
              </ul>
            </div>
          )}

          {userRole === 'TENANT' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Tenant Capabilities:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">View your lease information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Pay rent online</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Submit maintenance requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Track request status</span>
                </li>
              </ul>
            </div>
          )}

          {userRole === 'MAINTENANCE_STAFF' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Maintenance Staff Capabilities:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">View assigned maintenance tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Update request status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Add work notes and photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Track task completion</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
