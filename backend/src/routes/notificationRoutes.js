// backend/src/routes/notificationRoutes.js
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