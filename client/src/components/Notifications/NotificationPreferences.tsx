'use client';

import React, { useState, useEffect } from 'react';
import { notificationsApi } from '@/lib/notificationsApi';

interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  whatsappEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  dailyDigestEnabled: boolean;
  weeklyDigestEnabled: boolean;
  notificationTypes: {
    [key: string]: boolean;
  };
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    whatsappEnabled: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    dailyDigestEnabled: false,
    weeklyDigestEnabled: true,
    notificationTypes: {
      INVOICE_CREATED: true,
      INVOICE_SENT: true,
      PAYMENT_REMINDER: true,
      PAYMENT_RECEIVED: true,
      PAYMENT_FAILED: true,
      OVERDUE_NOTICE: true,
      MAINTENANCE_ALERT: true,
      BROADCAST: true,
      ANNOUNCEMENT: true,
      EMERGENCY: true,
      TARGETED_MESSAGE: true,
      LATE_FEE_NOTICE: true,
      SYSTEM_NOTIFICATION: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
      }
    } catch (err: any) {
      setError('Failed to load preferences');
      console.error('Fetch preferences error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channel: keyof Omit<NotificationPreferences, 'quietHoursStart' | 'quietHoursEnd' | 'quietHoursEnabled' | 'dailyDigestEnabled' | 'weeklyDigestEnabled' | 'notificationTypes'>) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: !prev[channel],
    }));
    setSuccess(false);
  };

  const handleTypeToggle = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: !prev.notificationTypes[type],
      },
    }));
    setSuccess(false);
  };

  const handleQuietHoursChange = (field: 'quietHoursStart' | 'quietHoursEnd', value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value,
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const response = await notificationsApi.updatePreferences(preferences);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to save preferences');
      }
    } catch (err: any) {
      setError('Error saving preferences');
      console.error('Save preferences error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Preferences</h1>
        <p className="text-gray-600">Control how and when you receive notifications</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✓ Preferences saved successfully!
        </div>
      )}

      {/* Communication Channels */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Communication Channels</h2>
        <p className="text-gray-600 text-sm mb-4">Choose which channels you want to receive notifications through</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'emailEnabled', label: 'Email', icon: '✉️' },
            { key: 'smsEnabled', label: 'SMS', icon: '📱' },
            { key: 'pushEnabled', label: 'Push Notifications', icon: '🔔' },
            { key: 'inAppEnabled', label: 'In-App', icon: '📬' },
          ].map(channel => (
            <label
              key={channel.key}
              className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
            >
              <input
                type="checkbox"
                checked={preferences[channel.key as keyof NotificationPreferences] as boolean}
                onChange={() => handleChannelToggle(channel.key as any)}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
              <span className="ml-3 text-lg">{channel.icon}</span>
              <span className="ml-2 font-medium text-gray-900">{channel.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Types</h2>
        <p className="text-gray-600 text-sm mb-4">Select which types of notifications you want to receive</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(preferences.notificationTypes).map(([type, enabled]) => (
            <label
              key={type}
              className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => handleTypeToggle(type)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <span className="ml-3 text-gray-900">{type.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiet Hours</h2>
        <p className="text-gray-600 text-sm mb-4">Don't receive non-urgent notifications during these hours</p>
        
        <div className="space-y-4">
          <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="checkbox"
              checked={preferences.quietHoursEnabled}
              onChange={() => setPreferences(prev => ({
                ...prev,
                quietHoursEnabled: !prev.quietHoursEnabled,
              }))}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
            <span className="ml-3 font-medium text-gray-900">Enable Quiet Hours</span>
          </label>

          {preferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => handleQuietHoursChange('quietHoursStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => handleQuietHoursChange('quietHoursEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Digest Options */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Digest Options</h2>
        <p className="text-gray-600 text-sm mb-4">Get a summary of notifications instead of individual alerts</p>
        
        <div className="space-y-3">
          <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="checkbox"
              checked={preferences.dailyDigestEnabled}
              onChange={() => setPreferences(prev => ({
                ...prev,
                dailyDigestEnabled: !prev.dailyDigestEnabled,
              }))}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
            <span className="ml-3 font-medium text-gray-900">Daily Digest (9:00 AM)</span>
          </label>
          
          <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="checkbox"
              checked={preferences.weeklyDigestEnabled}
              onChange={() => setPreferences(prev => ({
                ...prev,
                weeklyDigestEnabled: !prev.weeklyDigestEnabled,
              }))}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
            <span className="ml-3 font-medium text-gray-900">Weekly Digest (Monday 9:00 AM)</span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        <button
          onClick={fetchPreferences}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
