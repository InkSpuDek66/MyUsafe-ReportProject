// backend/src/routes/profileRoutes.js
// Routes สำหรับจัดการโปรไฟล์ผู้ใช้
// ================================
// Profile APIs Checklist
// 1. [GET] /api/profile - ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่
// 2. [PUT] /api/profile - อัปเดตข้อมูลโปรไฟล์ (ชื่อ, เบอร์โทร)
// 3. [POST] /api/profile/image - อัปเดตรูปโปรไฟล์
// 4. [PUT] /api/profile/password - เปลี่ยนรหัสผ่าน
// 5. [POST] /api/profile/download-oauth-image - ✅ ดาวน์โหลดรูป OAuth
// ================================
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