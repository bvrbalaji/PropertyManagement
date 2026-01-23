'use client';

import React from 'react';
import Link from 'next/link';

/**
 * NotificationMenu Component
 * Displays notification-related menu items for sidebar/dropdown
 * Use in your main navigation/settings menu
 */
export default function NotificationMenu() {
  return (
    <div className="space-y-2">
      <Link
        href="/notifications"
        className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <span className="text-xl">🔔</span>
        <span className="font-medium">Notifications</span>
      </Link>
      
      <Link
        href="/notifications/preferences"
        className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <span className="text-xl">⚙️</span>
        <span className="font-medium">Notification Settings</span>
      </Link>
      
      <Link
        href="/notifications/devices"
        className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <span className="text-xl">📱</span>
        <span className="font-medium">My Devices</span>
      </Link>
      
      <Link
        href="/notifications/analytics"
        className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <span className="text-xl">📊</span>
        <span className="font-medium">Analytics</span>
      </Link>
    </div>
  );
}
