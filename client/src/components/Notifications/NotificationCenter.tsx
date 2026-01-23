'use client';

import React, { useState, useEffect } from 'react';
import { notificationsApi } from '@/lib/notificationsApi';
import Link from 'next/link';

interface Notification {
  id: string;
  subject: string;
  body: string;
  notificationType: string;
  channels: string[];
  status: string;
  priority: string;
  createdAt: string;
  isRead: boolean;
  isArchived: boolean;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications();
      if (response.success) {
        setNotifications(response.data || []);
        const unread = (response.data || []).filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err: any) {
      setError('Failed to load notifications');
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await notificationsApi.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(
          notifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      const response = await notificationsApi.archiveNotification(notificationId);
      if (response.success) {
        setNotifications(
          notifications.filter(n => n.id !== notificationId)
        );
      }
    } catch (err) {
      console.error('Archive error:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INVOICE_CREATED':
      case 'INVOICE_SENT':
        return '📄';
      case 'PAYMENT_REMINDER':
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_FAILED':
        return '💳';
      case 'MAINTENANCE_ALERT':
        return '🔧';
      case 'BROADCAST':
      case 'ANNOUNCEMENT':
        return '📢';
      case 'EMERGENCY':
        return '🚨';
      default:
        return '📬';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'MEDIUM':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'LOW':
        return 'border-l-4 border-blue-500 bg-blue-50';
      default:
        return 'border-l-4 border-gray-300 bg-gray-50';
    }
  };

  const filteredNotifications = filterType === 'all'
    ? notifications.filter(n => !n.isArchived)
    : notifications.filter(n => !n.isArchived && n.notificationType === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">
            {unreadCount} New
          </span>
        </div>
        <p className="text-gray-600">Stay updated with important property and maintenance alerts</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {['INVOICE_CREATED', 'PAYMENT_REMINDER', 'MAINTENANCE_ALERT', 'BROADCAST', 'EMERGENCY'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-gray-600 text-lg">No notifications yet</p>
            <p className="text-gray-500 text-sm">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getPriorityColor(
                notification.priority
              )} ${!notification.isRead ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-2xl mt-1">
                    {getNotificationIcon(notification.notificationType)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {notification.subject}
                      </h3>
                      {!notification.isRead && (
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                      {notification.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded">
                        {notification.notificationType.replace(/_/g, ' ')}
                      </span>
                      {notification.channels && notification.channels.map((channel: string) => (
                        <span key={channel} className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {channel}
                        </span>
                      ))}
                      <span className="text-gray-500 ml-auto">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(notification.id);
                    }}
                    className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    title="Archive"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settings Link */}
      <div className="mt-8 text-center">
        <Link
          href="/notifications/preferences"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Manage Notification Preferences →
        </Link>
      </div>
    </div>
  );
}
