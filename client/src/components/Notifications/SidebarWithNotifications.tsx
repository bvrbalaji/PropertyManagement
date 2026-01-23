'use client';

import React, { useState } from 'react';
import NotificationMenu from '@/components/Notifications/NotificationMenu';

/**
 * Example Sidebar Component with Notifications Menu
 * Use this as a template for your main application sidebar
 */
export default function SidebarWithNotifications() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="h-screen flex flex-col">
        {/* Toggle Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Main Menu */}
          <div>
            {isOpen && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Main
              </h3>
            )}
            <ul className="space-y-2">
              <li>
                <a
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xl">📊</span>
                  {isOpen && <span className="font-medium">Dashboard</span>}
                </a>
              </li>
              <li>
                <a
                  href="/users"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xl">👥</span>
                  {isOpen && <span className="font-medium">Users</span>}
                </a>
              </li>
            </ul>
          </div>

          {/* Divider */}
          {isOpen && <hr className="border-gray-200" />}

          {/* Notifications Section */}
          {isOpen && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Notifications
              </h3>
              <NotificationMenu />
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {isOpen ? (
            <a href="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-xl">⚙️</span>
              <span className="font-medium">Settings</span>
            </a>
          ) : (
            <button className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-200 transition-colors" title="Settings">
              ⚙️
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
