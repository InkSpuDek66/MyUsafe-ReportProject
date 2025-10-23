// backend/routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/homeController');
// ✅ เรียกใช้ Middleware
const { protect, restrictTo } = require('../middleware/authMiddleware'); 

// Routes

// 1. ทุกคนดูรายการเรื่องร้องเรียนได้ (ไม่จำเป็นต้องล็อกอิน)
router.get('/', complaintController.getComplaints);

// 2. ทุกคนดูรายละเอียดเรื่องร้องเรียนได้
router.get('/:id', complaintController.getComplaintById);

// 3. REPORTER เท่านั้นที่สร้าง/ส่งเรื่องร้องเรียนได้
// ใช้ protect ก่อน เพื่อให้รู้ว่าใครส่ง, จากนั้นใช้ restrictTo('reporter')
router.post('/', protect, restrictTo('reporter'), complaintController.createComplaint); 

// 4. STAFF หรือ ADMIN เท่านั้นที่สามารถอัปเดตสถานะหรือมอบหมายงานได้
router.put('/:id', protect, restrictTo('admin', 'staff'), complaintController.updateComplaint);

// 5. ADMIN เท่านั้นที่สามารถลบได้
router.delete('/:id', protect, restrictTo('admin'), complaintController.deleteComplaint);


module.exports = router;