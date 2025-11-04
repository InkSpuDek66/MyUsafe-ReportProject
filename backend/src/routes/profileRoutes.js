// backend/src/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่
router.get('/', protect, profileController.getProfile);

// อัปเดตข้อมูลโปรไฟล์ (ชื่อ, เบอร์โทร)
router.put('/', protect, profileController.updateProfile);

// อัปเดตรูปโปรไฟล์
router.post('/image', protect, profileController.uploadMiddleware, profileController.updateProfileImage);

// เปลี่ยนรหัสผ่าน
router.put('/password', protect, profileController.updatePassword);

// ✅ ดาวน์โหลดรูป OAuth
router.post('/download-oauth-image', protect, profileController.downloadOAuthImage);

module.exports = router;