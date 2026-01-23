# Notification System - Integration Examples

## Backend Usage Examples

### 1. Send Payment Reminder Notification

```typescript
import notificationManagerService from './services/notificationManagerService';
import { NotificationType, NotificationChannel } from '@prisma/client';

// Send payment reminder 3 days before due date
const result = await notificationManagerService.createAndSendNotification({
  notificationType: NotificationType.PAYMENT_REMINDER,
  subject: 'Payment Reminder - Rent Due Soon',
  body: 'Your rent payment for XYZ Property is due on {dueDate}. Amount: {amount}',
  htmlBody: '<p>Your rent payment for XYZ Property is due on {dueDate}.</p>',
  channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP],
  recipientType: 'individual',
  recipientIds: ['tenant-id-1', 'tenant-id-2'],
  priority: 'high',
  createdBy: 'admin-id',
});

console.log(`Notification sent: ${result.notificationId}`);
console.log(`Delivered: ${result.deliveryCount}, Failed: ${result.failureCount}`);
```

### 2. Send Broadcast Message to Property

```typescript
const result = await notificationManagerService.sendBroadcastMessage(broadcastId);

// Alternative: Create and send in one step
const broadcast = await prisma.broadcastMessage.create({
  data: {
    propertyId: 'prop-123',
    title: 'Water Supply Maintenance',
    message: 'Water supply will be interrupted tomorrow 10 AM - 12 PM for maintenance.',
    htmlMessage: '<p>Water supply will be interrupted tomorrow 10 AM - 12 PM.</p>',
    targetAudience: 'all', // or 'tenants', 'owners', 'staff'
    channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
    createdBy: 'admin-id',
  },
});

await notificationManagerService.sendBroadcastMessage(broadcast.id);
```

### 3. Send Targeted Message to Specific Floors

```typescript
const result = await notificationManagerService.createAndSendNotification({
  notificationType: NotificationType.TARGETED_MESSAGE,
  subject: 'Maintenance on Your Floor',
  body: 'Elevator maintenance will be done on Floor 3 today from 2 PM - 4 PM.',
  channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
  recipientType: 'targeted',
  targetFloors: ['3'], // Only floor 3
  propertyId: 'prop-123',
  priority: 'normal',
  createdBy: 'admin-id',
});
```

### 4. Schedule a Notification

```typescript
const result = await notificationManagerService.createAndSendNotification({
  notificationType: NotificationType.INVOICE_CREATED,
  subject: 'Your Monthly Invoice',
  body: 'Your monthly invoice for rent is ready. Amount: {amount}',
  channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
  recipientType: 'individual',
  recipientIds: ['tenant-id-1'],
  priority: 'normal',
  scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  createdBy: 'admin-id',
});

// Notification will be sent automatically tomorrow (within 5 minutes)
```

### 5. Send Invoice Notification with Automatic Channels

```typescript
import emailService from './services/emailNotificationService';

// Send invoice immediately
const emailResult = await emailService.sendEmail({
  recipientEmail: 'tenant@example.com',
  subject: 'Invoice #INV-001',
  htmlBody: `
    <html>
      <body>
        <h2>Invoice #INV-001</h2>
        <p>Amount: Rs. 50,000</p>
        <p>Due Date: 2024-02-15</p>
        <a href="https://app.example.com/pay">Pay Now</a>
      </body>
    </html>
  `,
  recipientId: 'tenant-id-1',
  notificationId: 'notif-id-1',
});

if (emailResult.success) {
  console.log(`Email sent with delivery ID: ${emailResult.deliveryId}`);
}
```

### 6. Check Notification Preferences Before Sending

```typescript
import notificationPreferenceService from './services/notificationPreferenceService';

const shouldSend = await notificationPreferenceService.shouldSendNotification(
  userId,
  'PAYMENT_REMINDER',
  'email'
);

if (shouldSend.shouldSend) {
  // User wants payment reminder emails
  await emailService.sendEmail(...);
} else {
  console.log(`Skipped: ${shouldSend.reason}`);
}
```

### 7. Get Notification Statistics

```typescript
const stats = await notificationManagerService.getStatistics('prop-123');

console.log('Delivery Statistics:');
console.log(`Total Sent: ${stats.stats.totalSent}`);
console.log(`Delivery Rate: ${stats.stats.deliveryRate}%`);
console.log(`Open Rate: ${stats.stats.openRate}%`);
console.log(`Click Rate: ${stats.stats.clickRate}%`);

console.log('\nBy Channel:');
Object.entries(stats.stats.byChannel).forEach(([channel, data]) => {
  console.log(`${channel}: ${data.total} sent, ${data.delivered} delivered, ${data.failed} failed`);
});
```

---

## Frontend Usage Examples

### 1. Register Push Device

```typescript
import notificationsAPI from '@/lib/notificationsApi';

async function registerPushNotifications() {
  // Request permission and get FCM token
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    const token = await firebase.messaging().getToken();
    
    const result = await notificationsAPI.registerDevice({
      token,
      deviceId: device.getUniqueId(),
      deviceType: 'web',
      deviceModel: navigator.userAgent,
      appVersion: '1.0.0',
    });
    
    if (result.success) {
      console.log('Device registered for push notifications');
    }
  }
}
```

### 2. Get User Notifications

```typescript
async function loadNotifications() {
  const result = await notificationsAPI.getNotifications({
    limit: 20,
    offset: 0,
    status: 'unread', // Optional
  });
  
  if (result.success) {
    setNotifications(result.data.notifications);
    setTotal(result.data.total);
  }
}
```

### 3. Update Notification Preferences

```typescript
async function updatePreferences(preferences) {
  const result = await notificationsAPI.updatePreferences({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    invoiceNotifications: true,
    paymentNotifications: true,
    maintenanceNotifications: false,
    broadcastNotifications: true,
    emergencyNotifications: true,
    quietHourStart: 22,
    quietHourEnd: 8,
    doNotDisturbEnabled: true,
    dailyDigest: true,
  });
  
  if (result.success) {
    console.log('Preferences updated');
  }
}
```

### 4. Send Push Notification Test

```typescript
async function sendTestNotification() {
  const result = await notificationsAPI.sendNotification({
    notificationType: 'SYSTEM_NOTIFICATION',
    subject: 'Test Notification',
    body: 'This is a test notification',
    channels: ['PUSH'],
    recipientIds: [currentUserId],
  });
  
  if (result.success) {
    console.log('Test notification sent');
  }
}
```

### 5. React Component - Notification Center

```typescript
import React, { useEffect, useState } from 'react';
import notificationsAPI from '@/lib/notificationsApi';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    const result = await notificationsAPI.getNotifications({
      limit: 50,
    });
    
    if (result.success) {
      setNotifications(result.data.notifications);
      setUnreadCount(
        result.data.notifications.filter(n => !n.isRead).length
      );
    }
  }

  async function handleRead(notificationId) {
    await notificationsAPI.markAsRead(notificationId);
    loadNotifications();
  }

  async function handleArchive(notificationId) {
    await notificationsAPI.archiveNotification(notificationId);
    loadNotifications();
  }

  return (
    <div className="notification-center">
      <h2>Notifications ({unreadCount} unread)</h2>
      {notifications.map(notif => (
        <div key={notif.id} className="notification-item">
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <small>{new Date(notif.createdAt).toLocaleString()}</small>
          <button onClick={() => handleRead(notif.id)}>
            {notif.isRead ? 'Mark Unread' : 'Mark Read'}
          </button>
          <button onClick={() => handleArchive(notif.id)}>Archive</button>
        </div>
      ))}
    </div>
  );
}
```

### 6. React Component - Notification Preferences

```typescript
import React, { useState, useEffect } from 'react';
import notificationsAPI from '@/lib/notificationsApi';

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const result = await notificationsAPI.getPreferences();
    if (result.success) {
      setPreferences(result.data);
    }
  }

  async function handleUpdate(field, value) {
    const result = await notificationsAPI.updatePreferences({
      ...preferences,
      [field]: value,
    });
    
    if (result.success) {
      setPreferences(result.data);
    }
  }

  if (!preferences) return <div>Loading...</div>;

  return (
    <div className="preferences">
      <h2>Notification Preferences</h2>
      
      <section>
        <h3>Channels</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.emailEnabled}
            onChange={(e) => handleUpdate('emailEnabled', e.target.checked)}
          />
          Email
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.smsEnabled}
            onChange={(e) => handleUpdate('smsEnabled', e.target.checked)}
          />
          SMS
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.pushEnabled}
            onChange={(e) => handleUpdate('pushEnabled', e.target.checked)}
          />
          Push Notifications
        </label>
      </section>

      <section>
        <h3>Notification Types</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.invoiceNotifications}
            onChange={(e) => handleUpdate('invoiceNotifications', e.target.checked)}
          />
          Invoice Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.paymentNotifications}
            onChange={(e) => handleUpdate('paymentNotifications', e.target.checked)}
          />
          Payment Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.broadcastNotifications}
            onChange={(e) => handleUpdate('broadcastNotifications', e.target.checked)}
          />
          Broadcast Announcements
        </label>
      </section>

      <section>
        <h3>Quiet Hours</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.doNotDisturbEnabled}
            onChange={(e) => handleUpdate('doNotDisturbEnabled', e.target.checked)}
          />
          Enable Quiet Hours
        </label>
        {preferences.doNotDisturbEnabled && (
          <>
            <input
              type="number"
              min="0"
              max="23"
              value={preferences.quietHourStart || 0}
              onChange={(e) => handleUpdate('quietHourStart', parseInt(e.target.value))}
            />
            to
            <input
              type="number"
              min="0"
              max="23"
              value={preferences.quietHourEnd || 8}
              onChange={(e) => handleUpdate('quietHourEnd', parseInt(e.target.value))}
            />
          </>
        )}
      </section>

      <section>
        <h3>Digest Settings</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.dailyDigest}
            onChange={(e) => handleUpdate('dailyDigest', e.target.checked)}
          />
          Daily Digest Email
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.weeklyDigest}
            onChange={(e) => handleUpdate('weeklyDigest', e.target.checked)}
          />
          Weekly Digest Email
        </label>
      </section>
    </div>
  );
}
```

### 7. Admin - Send Broadcast Message

```typescript
async function sendBroadcast(data) {
  const result = await notificationsAPI.sendBroadcast({
    propertyId: data.propertyId,
    title: data.title,
    message: data.message,
    htmlMessage: data.htmlMessage,
    targetAudience: data.targetAudience, // 'all', 'tenants', etc.
    targetFloors: data.targetFloors || [],
    targetApartments: data.targetApartments || [],
    channels: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'],
  });
  
  if (result.success) {
    toast.success(`Broadcast sent to ${result.data.sentCount} residents`);
  }
}
```

---

## Webhook Handlers

### Email Delivery Webhook

```typescript
// For SendGrid/other email providers
app.post('/webhooks/email-events', (req, res) => {
  const events = req.body;
  
  events.forEach(async (event) => {
    const { email, event: eventType, delivery_id } = event;
    
    await emailService.verifyDelivery(delivery_id, eventType);
  });
  
  res.json({ success: true });
});
```

### SMS Delivery Webhook

```typescript
// For MSG91/SMS provider
app.post('/webhooks/sms-delivery', (req, res) => {
  const { transaction_id, status } = req.body;
  
  await smsService.verifyDelivery(transaction_id, status);
  
  res.json({ success: true });
});
```

---

**Integration examples complete! Ready for production implementation.** 🚀
