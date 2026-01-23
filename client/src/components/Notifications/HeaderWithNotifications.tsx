'use client';

import React from 'react';
import NotificationBell from '@/components/Notifications/NotificationBell';

/**
 * Example Header Component with Notifications
 * Use this as a template for your main application header
 */
export default function HeaderWithNotifications() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Property Management
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </a>
            <a href="/settings" className="text-gray-700 hover:text-blue-600 transition-colors">
              Settings
            </a>
            <a href="/help" className="text-gray-700 hover:text-blue-600 transition-colors">
              Help
            </a>
          </nav>

          {/* Right Section with Notifications */}
          <div className="flex items-center gap-4">
            {/* Notification Bell - Important! */}
            <NotificationBell />

            {/* User Profile / Logout Button */}
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              👤 Profile
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
