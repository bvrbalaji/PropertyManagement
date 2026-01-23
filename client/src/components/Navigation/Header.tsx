'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserRole } from '@/lib/auth';
import Cookies from 'js-cookie';

type UserRole = 'ADMIN' | 'FLAT_OWNER' | 'TENANT' | 'MAINTENANCE_STAFF' | null;

export default function Header() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
          setUserName(userData.fullName || userData.email || 'User');
        } catch (e) {
          setUserName('User');
        }
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('userRole');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const navLinks = [
    { label: 'Home', href: '/', show: true },
    { label: 'Dashboard', href: getDefaultDashboard(userRole), show: isLoggedIn },
    { label: 'Reports', href: '/reports', show: isLoggedIn && ['ADMIN', 'FLAT_OWNER'].includes(userRole!) },
    { label: 'Notifications', href: '/notifications', show: isLoggedIn },
  ];

  function getDefaultDashboard(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'FLAT_OWNER':
        return '/dashboard/flat-owner';
      case 'TENANT':
        return '/dashboard/tenant';
      case 'MAINTENANCE_STAFF':
        return '/dashboard/maintenance';
      default:
        return '/';
    }
  }

  const isActive = (href: string) => pathname === href;

  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/verify-otp') {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <span className="text-2xl">🏢</span>
            <span>PropertyMgt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.show && (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Welcome,</span>
                  <span className="font-semibold text-gray-900">{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            )}
            {!isLoggedIn && (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              link.show && (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
