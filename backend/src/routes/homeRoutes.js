// backend/src/routes/homeRoutes.js
// Routes สำหรับจัดการเรื่องร้องเรียน
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/homeController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/homeModel'); // ⭐ เพิ่มบรรทัดนี้

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
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
        'video/x-msvideo'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP) และวิดีโอ (MP4, MOV, AVI)`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 5
    },
    fileFilter: fileFilter
});

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 20MB ต่อไฟล์)'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'อัพโหลดได้สูงสุด 5 ไฟล์เท่านั้น'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'ชื่อ field ไม่ถูกต้อง (ต้องใช้ "images")'
            });
        }
        return res.status(400).json({
            success: false,
            error: `Multer Error: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            error: err.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์'
        });
    }
    next();
};

// ================= ROUTES =================
// ⭐ ย้าย specific routes มาไว้ก่อน dynamic routes

// GET all complaints (with filters)
router.get('/', complaintController.getComplaints);

// Specific route - ต้องอยู่ก่อน /:id
router.get('/my-complaints', async (req, res) => {
    try {
        // TODO: ใช้ user_id จาก authentication
        const userId = req.user?.user_id || 'U0000001'; // mock for now

        const complaints = await Complaint.find({ user_id: userId })
            .sort({ datetime_reported: -1 });

        res.json({
            success: true,
            data: complaints
        });
    } catch (error) {
        console.error('Get my complaints error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST - Create new complaint
router.post('/',
    upload.array('images', 5),
    handleMulterError,
    complaintController.createComplaint
);

// ⭐ Dynamic route - ต้องอยู่หลัง specific routes
router.get('/:id', complaintController.getComplaintById);

// PUT - Update complaint
router.put('/:id', complaintController.updateComplaint);

// DELETE - Delete complaint
router.delete('/:id', complaintController.deleteComplaint);

module.exports = router;