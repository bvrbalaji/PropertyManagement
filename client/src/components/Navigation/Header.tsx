'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { getUserRole } from '@/lib/auth';
import Cookies from 'js-cookie';

type UserRole = 'ADMIN' | 'FLAT_OWNER' | 'TENANT' | 'MAINTENANCE_STAFF' | null;

export default function Header() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check auth status
  const checkAuth = useCallback(() => {
    try {
      const token =  Cookies.get('accessToken');
      const role = getUserRole();
      
      console.log('[Header] Checking auth - token:', !!token, 'role:', role, 'time:', new Date().toISOString());
      
      if (token) {
        setIsLoggedIn(true);
        if (role) {
          setUserRole(role as UserRole);
        }
        
        // Get user name from Cookies
        try {
          const userDataStr = Cookies.get('userData');
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            const displayName = userData.fullName || userData.email || userData.name || 'User';
            setUserName(displayName);
            setUserRole(role as UserRole);
            setMounted(true);
            setIsLoggedIn(true);
            console.log('[Header] User name set to:', displayName);
          } else {
            setUserName('User');
            console.log('[Header] No userData in Cookies, using default');
          }
        } catch (e) {
          console.error('[Header] Error parsing userData:', e);
          setUserName('User');
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName('');
        console.log('[Header] Not authenticated - clearing state');
      }
    } catch (error) {
      console.error('[Header] Auth check error:', error);
    }
  }, []);

  // Mount effect - set mounted immediately
  useEffect(() => {
    // Immediately check auth when component mounts
   try {
      const token =  Cookies.get('accessToken');
      const role = getUserRole();
      
      console.log('[Header] Checking auth - token:', !!token, 'role:', role, 'time:', new Date().toISOString());
      
      if (token) {
        setIsLoggedIn(true);
        if (role) {
          setUserRole(role as UserRole);
        }
        
        // Get user name from Cookies
        try {
          const userDataStr = Cookies.get('userData');
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            const displayName = userData.fullName || userData.email || userData.name || 'User';
            setUserName(displayName);
            setUserRole(role as UserRole);
            setMounted(true);
            setIsLoggedIn(true);
            console.log('[Header] User name set to:', displayName);
          } else {
            setUserName('User');
            console.log('[Header] No userData in Cookies, using default');
          }
        } catch (e) {
          console.error('[Header] Error parsing userData:', e);
          setUserName('User');
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName('');
        console.log('[Header] Not authenticated - clearing state');
      }
    } catch (error) {
      console.error('[Header] Auth check error:', error);
    }
    
    setMounted(true);
    // Check auth again after mount
    checkAuth();
  }, [checkAuth]);

  // // Check auth when pathname changes (route navigation)
  // useEffect(() => {
  //   if (mounted) {
  //     checkAuth();
  //   }
  // }, [pathname]);

  // Listen for storage changes and custom events
  // useEffect(() => {
  //   if (!mounted) return;

  //   const handleStorageChange = (e: StorageEvent) => {
  //     console.log('[Header] Storage event detected:', e.key);
  //     if (e.key === 'userData' || e.key === null) {
  //       // Small delay to ensure all storage operations are complete
  //       setTimeout(() => checkAuth(), 10);
  //     }
  //   };

  //   const handleLoginEvent = () => {
  //     console.log('[Header] Login event detected');
  //     // Use setTimeout to ensure Cookies is updated
  //     setTimeout(() => checkAuth(), 50);
  //   };

  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'visible') {
  //       console.log('[Header] Page became visible, checking auth');
  //       checkAuth();
  //     }
  //   };

  //   window.addEventListener('storage', handleStorageChange);
  //   window.addEventListener('userLoggedIn', handleLoginEvent);
  //   document.addEventListener('visibilitychange', handleVisibilityChange);
    
  //   return () => {
  //     window.removeEventListener('storage', handleStorageChange);
  //     window.removeEventListener('userLoggedIn', handleLoginEvent);
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, [mounted, checkAuth]);


  // Watch for userData in Cookies and immediately sync
  // useEffect(() => {
  //   const userData = Cookies.getItem('userData');
  //   if (userData && !isLoggedIn) {
  //     console.log('[Header] userData detected in Cookies, syncing...');
  //     checkAuth();
  //   }
  // }, [isLoggedIn, checkAuth]);

  const handleLogout = async () => {
    try {
      // Call logout API if available
      // await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('userRole');
      console.log('[Header] Logged out, cleared storage');
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName('');
      setIsOpen(false);
      router.push('/login');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/', show: true },
    { label: 'Dashboard', href: getDefaultDashboard(userRole), show: isLoggedIn && userRole !== null },
    { label: 'Reports', href: '/reports', show: isLoggedIn && userRole !== null && ['ADMIN', 'FLAT_OWNER'].includes(userRole) },
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

  // Only render interactive content after client hydration
  if (!mounted) {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <span className="text-2xl">🏢</span>
              <span>PropertyMgt</span>
            </Link>
          </div>
        </div>
      </nav>
    );
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
