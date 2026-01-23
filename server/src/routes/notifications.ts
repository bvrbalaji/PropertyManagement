// Notification Routes
import express from 'express';
import notificationController from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Middleware
router.use(authenticate);

// ============ NOTIFICATIONS ============

// Send notification
router.post('/send', (req, res) => notificationController.sendNotification(req, res));

// Send broadcast message
router.post('/broadcast/send', (req, res) => notificationController.sendBroadcast(req, res));

// Get user notifications
router.get('/', (req, res) => notificationController.getNotifications(req, res));

// Mark notification as read
router.put('/:notificationId/read', (req, res) => notificationController.markAsRead(req, res));

// Archive notification
router.put('/:notificationId/archive', (req, res) => notificationController.archiveNotification(req, res));

// ============ PREFERENCES ============

// Get notification preferences
router.get('/preferences/get', (req, res) => notificationController.getPreferences(req, res));

// Update notification preferences
router.patch('/preferences/update', (req, res) => notificationController.updatePreferences(req, res));

// Set quiet hours
router.post('/preferences/quiet-hours', (req, res) => notificationController.setQuietHours(req, res));

// Enable digest delivery
router.post('/preferences/digest/enable', (req, res) => notificationController.enableDigest(req, res));

// ============ PUSH DEVICES ============

// Register device token
router.post('/devices/register', (req, res) => notificationController.registerDevice(req, res));

// Get user devices
router.get('/devices', (req, res) => notificationController.getUserDevices(req, res));

// Unregister device
router.delete('/devices/:deviceId', (req, res) => notificationController.unregisterDevice(req, res));

// Track push engagement
router.post('/devices/:deliveryId/track/:event', (req, res) => notificationController.trackEngagement(req, res));

// ============ TEMPLATES ============

// Create template
router.post('/templates/create', (req, res) => notificationController.createTemplate(req, res));

// List templates
router.get('/templates', (req, res) => notificationController.getTemplates(req, res));

// ============ ANALYTICS ============

// Get notification statistics
router.get('/statistics', (req, res) => notificationController.getStatistics(req, res));

export default router;
