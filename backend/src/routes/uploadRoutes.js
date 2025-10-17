// backend/src/routes/uploadRoutes.js
// Routes สำหรับจัดการการอัปโหลดไฟล์
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/', uploadController.uploadMiddleware, uploadController.handleUpload);

module.exports = router;