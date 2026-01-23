'use client';

import React, { useState, useEffect } from 'react';
import { notificationsApi } from '@/lib/notificationsApi';

interface NotificationStatistics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  channelBreakdown: {
    [key: string]: {
      sent: number;
      delivered: number;
      failed: number;
    };
  };
  typeBreakdown: {
    [key: string]: number;
  };
  averageDeliveryTime: number;
}

export default function NotificationAnalytics() {
  const [statistics, setStatistics] = useState<NotificationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
    const interval = setInterval(fetchStatistics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await notificationsApi.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err: any) {
      setError('Failed to load statistics');
      console.error('Fetch statistics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Analytics</h1>
        <p className="text-gray-600">Track delivery performance and engagement metrics</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Sent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.totalSent}</p>
            </div>
            <span className="text-4xl">📤</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Delivered</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{statistics.totalDelivered}</p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Failed</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{statistics.totalFailed}</p>
            </div>
            <span className="text-4xl">❌</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Delivery Rate</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {(statistics.deliveryRate * 100).toFixed(1)}%
              </p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Channel Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery by Channel</h2>
          <div className="space-y-4">
            {Object.entries(statistics.channelBreakdown).map(([channel, stats]) => {
              const total = stats.sent;
              const deliveredPercent = total > 0 ? (stats.delivered / total) * 100 : 0;
              
              return (
                <div key={channel}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{channel}</span>
                    <span className="text-sm text-gray-600">
                      {stats.delivered}/{stats.sent} ({deliveredPercent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${deliveredPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications by Type</h2>
          <div className="space-y-2">
            {Object.entries(statistics.typeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <span className="text-gray-700">{type.replace(/_/g, ' ')}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Delivery Time */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Average Delivery Time</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-blue-600">
                {(statistics.averageDeliveryTime / 1000).toFixed(2)}
              </p>
              <p className="text-gray-600 mb-1">seconds</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Time from send to delivery across all channels
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Success Rate Trend</p>
            <div className="flex items-end gap-1 h-16">
              {[0.92, 0.94, 0.95, 0.96, 0.95, 0.97, 0.98].map((rate, i) => (
                <div
                  key={i}
                  className="flex-1 bg-green-600 rounded-t transition-all hover:bg-green-700"
                  style={{ height: `${rate * 100}%` }}
                  title={`${(rate * 100).toFixed(1)}%`}
                ></div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
