'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { notificationsApi } from '@/lib/notificationsApi';

/**
 * NotificationBell Component
 * Displays unread notification count in header
 * Placed in main navigation/header for quick access
 */
export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsApi.getNotifications();
      if (response.success && response.data) {
        const unread = response.data.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href="/notifications"
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
      title="Notifications"
    >
      <span className="text-xl">🔔</span>
      {unreadCount > 0 && !loading && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
