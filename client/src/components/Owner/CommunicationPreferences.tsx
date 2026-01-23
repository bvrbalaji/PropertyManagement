'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ownerApi from '@/lib/ownerApi';

interface CommunicationPreferences {
  id: string;
  ownerProfileId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  phoneNotifications: boolean;
  maintenanceAlerts: boolean;
  financialUpdates: boolean;
  documentReminders: boolean;
  tenantCommunications: boolean;
  preferredLanguage: 'en' | 'hi' | 'ta' | 'te' | 'ka' | 'ml';
  weeklyDigest: boolean;
  monthlyReport: boolean;
  notificationTiming: 'immediate' | 'daily' | 'weekly';
  updatedAt: string;
}

export default function CommunicationPreferences() {
  const [preferences, setPreferences] = useState<CommunicationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<Partial<CommunicationPreferences>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const res = await ownerApi.getCommunicationPreferences();
      if (res.data?.success) {
        setPreferences(res.data.data);
        setTempPreferences(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load preferences');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CommunicationPreferences, value: any) => {
    setTempPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await ownerApi.updateCommunicationPreferences(tempPreferences);

      if (res.data?.success) {
        setPreferences(res.data.data);
        setHasChanges(false);
        toast.success('Preferences updated successfully');
      } else {
        toast.error(res.data?.message || 'Failed to update preferences');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setTempPreferences(preferences);
      setHasChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load preferences</p>
      </div>
    );
  }

  const toggleNotification = (field: keyof CommunicationPreferences) => {
    if (typeof tempPreferences[field] === 'boolean') {
      handleChange(field, !tempPreferences[field]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Communication Preferences</h2>
          <p className="text-sm text-gray-600 mt-1">Control how and when you receive notifications</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Notification Channels */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>

            <div className="space-y-4">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempPreferences.emailNotifications}
                  onChange={() => toggleNotification('emailNotifications')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive important updates via email</p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempPreferences.smsNotifications}
                  onChange={() => toggleNotification('smsNotifications')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Get instant alerts via text message</p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempPreferences.phoneNotifications}
                  onChange={() => toggleNotification('phoneNotifications')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Phone Call Notifications</p>
                  <p className="text-sm text-gray-600">Receive urgent notifications by phone call</p>
                </div>
              </label>
            </div>
          </section>

          {/* Notification Types */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>

            <div className="space-y-4">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempPreferences.maintenanceAlerts}
                  onChange={() => toggleNotification('maintenanceAlerts')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Maintenance Alerts</p>
                  <p className="text-sm text-gray-600">Notifications about property maintenance issues</p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempPreferences.financialUpdates}
                  onChange={() => toggleNotification('financialUpdates')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Financial Updates</p>
                  <p className="text-sm text-gray-600">Notifications about rental income and expenses</p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempPreferences.documentReminders}
                  onChange={() => toggleNotification('documentReminders')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Document Reminders</p>
                  <p className="text-sm text-gray-600">Reminders for document uploads and renewals</p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempPreferences.tenantCommunications}
                  onChange={() => toggleNotification('tenantCommunications')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Tenant Communications</p>
                  <p className="text-sm text-gray-600">Updates from tenants and property management</p>
                </div>
              </label>
            </div>
          </section>

          {/* Frequency & Digest */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Digest & Reports</h3>

            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <label className="flex items-center mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempPreferences.weeklyDigest}
                    onChange={() => toggleNotification('weeklyDigest')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-3 font-medium text-gray-900">Weekly Digest</span>
                </label>
                <p className="text-sm text-gray-600 ml-7">
                  Receive a weekly summary of all property activities
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <label className="flex items-center mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempPreferences.monthlyReport}
                    onChange={() => toggleNotification('monthlyReport')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-3 font-medium text-gray-900">Monthly Report</span>
                </label>
                <p className="text-sm text-gray-600 ml-7">
                  Receive detailed monthly financial and operational reports
                </p>
              </div>
            </div>
          </section>

          {/* Notification Timing */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Timing</h3>

            <div className="space-y-3">
              {['immediate', 'daily', 'weekly'].map((timing) => (
                <label
                  key={timing}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="notification-timing"
                    value={timing}
                    checked={tempPreferences.notificationTiming === timing}
                    onChange={() => handleChange('notificationTiming', timing)}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 capitalize">{timing}</p>
                    <p className="text-sm text-gray-600">
                      {timing === 'immediate' && 'Get notifications as they happen'}
                      {timing === 'daily' && 'Receive notifications once per day'}
                      {timing === 'weekly' && 'Receive notifications once per week'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Language */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Language</h3>

            <select
              value={tempPreferences.preferredLanguage || 'en'}
              onChange={(e) => handleChange('preferredLanguage', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ka">ಕನ್ನಡ (Kannada)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>
          </section>

          {/* Last Updated */}
          {preferences.updatedAt && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Last updated:</strong> {new Date(preferences.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
