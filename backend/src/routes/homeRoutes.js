// backend/src/routes/homeRoutes.js
// Routes สำหรับจัดการเรื่องร้องเรียน
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/homeController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ ตรวจสอบและสร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ ตั้งค่า Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP) และวิดีโอ (MP4, MOV, AVI)'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 5 },
  fileFilter,
});

// ✅ Middleware จัดการ Error ของ Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'ไฟล์ใหญ่เกิน 20MB' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, error: 'อัปโหลดได้สูงสุด 5 ไฟล์' });
    }
    return res.status(400).json({ success: false, error: `Multer Error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
};

// ✅ Routes หลัก
router.get('/', complaintController.getComplaints);
router.get('/:id', complaintController.getComplaintById);

// ✅ POST: สร้างเรื่องร้องเรียนใหม่
router.post('/', upload.array('images', 5), handleMulterError, complaintController.createComplaint);

// ✅ PUT: แก้ไขเรื่องร้องเรียน
router.put('/:id', complaintController.updateComplaint);
router.put('/:id/status', complaintController.updateComplaintStatus);

// ✅ DELETE: ลบเรื่องร้องเรียน
router.delete('/:id', complaintController.deleteComplaint);

// ✅ PATCH: เปลี่ยนสถานะ + บันทึกชื่อผู้เปลี่ยน (Person 3)
router.patch('/:id/status', async (req, res) => {
  const Complaint = require('../models/homeModel');
  const { status, updated_by } = req.body;

  try {
    const complaint = await Complaint.findOne({ complaint_id: req.params.id });
    if (!complaint)
      return res.status(404).json({ success: false, error: 'ไม่พบเรื่องร้องเรียนนี้' });

    const now = new Date();
    complaint.current_status = status;
    complaint.status_history.push({
      status_id: 'S' + Date.now().toString().slice(-7),
      status_name: status,
      updated_at: now,
      updated_by: updated_by || 'ไม่ระบุ',
    });

    if (status === 'เสร็จสิ้น') {
      complaint.completed_date = now;
      const diff = now - complaint.datetime_reported;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      complaint.time_used = `${days} วัน ${hours} ชั่วโมง`;
    }

    await complaint.save();
    res.json({ success: true, message: 'อัปเดตสถานะสำเร็จ', data: complaint });
  } catch (err) {
    console.error('Change Status Error:', err);
    res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  }
});

module.exports = router;
