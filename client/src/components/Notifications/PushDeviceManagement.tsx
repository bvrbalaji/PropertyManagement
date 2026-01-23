'use client';

import React, { useState, useEffect } from 'react';
import { notificationsApi } from '@/lib/notificationsApi';

interface PushDevice {
  id: string;
  deviceId: string;
  deviceType: string;
  deviceName?: string;
  osVersion?: string;
  appVersion?: string;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export default function PushDeviceManagement() {
  const [devices, setDevices] = useState<PushDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getDevices();
      if (response.success) {
        setDevices(response.data || []);
      }
    } catch (err: any) {
      setError('Failed to load devices');
      console.error('Fetch devices error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDevice = async () => {
    try {
      setRegistering(true);
      setError('');

      // Check if device registration is supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setError('Push notifications not supported in this browser');
        return;
      }

      // Request notification permission
      if (Notification.permission === 'denied') {
        setError('Notification permission denied. Please enable it in browser settings.');
        return;
      }

      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setError('Notification permission not granted');
          return;
        }
      }

      // Register service worker and get device token
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const token = JSON.stringify(subscription);

      // Send token to backend
      const response = await notificationsApi.registerDevice({
        token,
        deviceId: navigator.userAgent.substring(0, 50),
        deviceType: 'Web',
        deviceName: `${navigator.platform} - ${navigator.userAgent.split(' ').slice(-1)[0]}`,
        osVersion: navigator.platform,
        appVersion: '1.0',
      });

      if (response.success) {
        setSuccess('Device registered successfully for push notifications');
        fetchDevices();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to register device');
      }
    } catch (err: any) {
      setError(err.message || 'Error registering device');
      console.error('Register device error:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregisterDevice = async (deviceId: string) => {
    try {
      const response = await notificationsApi.unregisterDevice(deviceId);
      if (response.success) {
        setSuccess('Device unregistered');
        setDevices(devices.filter(d => d.id !== deviceId));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to unregister device');
      }
    } catch (err: any) {
      setError('Error unregistering device');
      console.error('Unregister device error:', err);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'web':
        return '🖥️';
      case 'ios':
        return '🍎';
      case 'android':
        return '🤖';
      default:
        return '📱';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Push Notification Devices</h1>
        <p className="text-gray-600">Manage devices that receive push notifications</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✓ {success}
        </div>
      )}

      {/* Register New Device */}
      <div className="mb-8 bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-600">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Enable Push Notifications</h2>
        <p className="text-gray-700 text-sm mb-4">
          Register this device to receive push notifications on your browser
        </p>
        <button
          onClick={handleRegisterDevice}
          disabled={registering}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {registering ? 'Registering...' : '🔔 Register This Device'}
        </button>
      </div>

      {/* Registered Devices */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Active Devices ({devices.length})
        </h2>

        {devices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">📱</p>
            <p className="text-gray-600">No devices registered</p>
            <p className="text-gray-500 text-sm">Register a device to start receiving push notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map(device => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl">{getDeviceIcon(device.deviceType)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {device.deviceName || `${device.deviceType} Device`}
                      </h3>
                      {device.isActive ? (
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-gray-400 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {device.deviceType} {device.osVersion && `(${device.osVersion})`}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Registered: {new Date(device.createdAt).toLocaleDateString()}</span>
                      <span>Last Active: {new Date(device.lastActiveAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleUnregisterDevice(device.id)}
                  className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Browser Support Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
        <p className="font-semibold mb-2">📋 Browser Support</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Chrome/Chromium 50+</li>
          <li>Firefox 48+</li>
          <li>Edge 17+</li>
          <li>Opera 37+</li>
          <li>Safari 16+ (macOS 13+)</li>
        </ul>
      </div>
    </div>
  );
}
