// backend/src/routes/notificationRoutes.js
// Routes สำหรับจัดการการแจ้งเตือน
// ================================
// Notification APIs Checklist
// 1. [GET] /api/notifications/:userId - ดึงการแจ้งเตือนทั้งหมด
// 2. [PUT] /api/notifications/:id/read - อ่านการแจ้งเตือน
// 3. [PUT] /api/notifications/read-all - อ่านทั้งหมด
// 4. [DELETE] /api/notifications/:id - ลบการแจ้งเตือน
// ================================
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// GET: ดึงการแจ้งเตือนทั้งหมด
router.get('/:userId', notificationController.getNotifications);

// PUT: อ่านการแจ้งเตือน
router.put('/:id/read', notificationController.markAsRead);

// PUT: อ่านทั้งหมด
router.put('/read-all', notificationController.markAllAsRead);

// DELETE: ลบการแจ้งเตือน
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;