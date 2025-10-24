// backend/src/controllers/uploadController.js
// Controller สำหรับจัดการการอัพโหลดไฟล์รูปภาพ
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// กำหนดที่เก็บไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// ตรวจสอบประเภทไฟล์
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (JPEG, JPG, PNG, GIF)'));
    }
};

// สร้าง upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: fileFilter
});

// Export middleware
exports.uploadMiddleware = upload.array('images', 5); // สูงสุด 5 รูป

// Upload handler
exports.handleUpload = (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'ไม่พบไฟล์ที่อัพโหลด'
            });
        }

        // สร้าง URL ของไฟล์
        const fileUrls = req.files.map(file => {
            return `/uploads/${file.filename}`;
        });

        res.json({
            success: true,
            message: 'อัพโหลดไฟล์สำเร็จ',
            data: fileUrls
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์'
        });
    }
};