// backend/src/routes/homeRoutes.js
// Routes สำหรับจัดการเรื่องร้องเรียน (Complaints)
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/homeController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/homeModel');

// ตรวจสอบและสร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่า Multer
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
                error: 'ชื่อ field ไม่ถูกต้อง'
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
// GET - Get all complaints
router.get('/', complaintController.getComplaints);

// Specific route - My Complaints
router.get('/my-complaints', async (req, res) => {
    try {
        const userId = req.user?.user_id || 'U0000001';
        
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

// Dynamic route
router.get('/:id', complaintController.getComplaintById);

// POST - Create new complaint
router.post('/', upload.array('images', 5), handleMulterError, complaintController.createComplaint);

// PUT - Update complaint
router.put('/:id', complaintController.updateComplaint);

// DELETE - Delete complaint
router.delete('/:id', complaintController.deleteComplaint);

// PATCH: เปลี่ยนสถานะ + บันทึกรายละเอียดการแก้ไข + แจ้งเตือน
router.patch('/:id/status', async (req, res) => {
    const { status, updated_by, resolution_details } = req.body;
    const notificationController = require('../controllers/notificationController');

    try {
        const complaint = await Complaint.findOne({ complaint_id: req.params.id });
        if (!complaint)
            return res.status(404).json({ success: false, error: 'ไม่พบเรื่องร้องเรียนนี้' });

        const oldStatus = complaint.current_status; // ✅ เก็บสถานะเก่า
        const now = new Date();
        complaint.current_status = status;
        
        console.log('📝 Status change:', { 
            complaint_id: req.params.id, 
            old: oldStatus, 
            new: status,
            user_id: complaint.user_id 
        }); // ✅ เพิ่ม log
        
        complaint.status_history.push({
            status_id: 'S' + Date.now().toString().slice(-7),
            status_name: status,
            updated_at: now,
            updated_by: updated_by || 'ไม่ระบุ',
            resolution_details: resolution_details || ''
        });

        if (status === 'เสร็จสิ้น') {
            complaint.completed_date = now;
            const diff = now - complaint.datetime_reported;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            complaint.time_used = `${days} วัน ${hours} ชั่วโมง`;
        }

        await complaint.save();
        console.log('✅ Status updated in DB'); // ✅ เพิ่ม log

        // 🔔 สร้างการแจ้งเตือนเมื่อเปลี่ยนสถานะ
        if (status !== oldStatus) {
            let notifMessage = '';
            let notifType = 'status_change';
            
            // กำหนดข้อความแจ้งเตือนตามสถานะ
            if (status === 'กำลังดำเนินการ') {
                notifMessage = `เรื่องร้องเรียน "${complaint.title}" กำลังดำเนินการโดยเจ้าหน้าที่`;
                notifType = 'status_change';
            } else if (status === 'เสร็จสิ้น') {
                notifMessage = `เรื่องร้องเรียน "${complaint.title}" ได้รับการจัดการเสร็จสิ้นแล้ว ใช้เวลา ${complaint.time_used}`;
                notifType = 'completed';
            } else if (status === 'ยกเลิก') {
                notifMessage = `เรื่องร้องเรียน "${complaint.title}" ถูกยกเลิก`;
                notifType = 'cancelled';
            } else {
                notifMessage = `เรื่องร้องเรียน "${complaint.title}" เปลี่ยนสถานะเป็น "${status}"`;
            }
            
            console.log('🔔 Creating notification:', notifMessage); // ✅ เพิ่ม log
            
            await notificationController.createNotification(
                complaint.user_id,
                complaint.complaint_id,
                notifType,
                notifMessage,
                {
                    old_status: oldStatus,
                    new_status: status,
                    updated_by: updated_by || 'ไม่ระบุ',
                    resolution_details: resolution_details,
                    time_used: complaint.time_used
                }
            );
            
            console.log('✅ Notification created'); // ✅ เพิ่ม log
        }

        res.json({ success: true, message: 'อัปเดตสถานะสำเร็จ', data: complaint });
    } catch (err) {
        console.error('❌ Change Status Error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ',
            details: err.message 
        });
    }
});

// ✅ PATCH: เสร็จสิ้นงาน + อัปโหลดรูปภาพ/วิดีโอ
router.patch('/:id/complete', (req, res, next) => {
    upload.array('resolution_images', 5)(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ 
                success: false, 
                error: err.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' 
            });
        }
        next();
    });
}, async (req, res) => {
    try {
        const { resolution_note, updated_by } = req.body;
        const notificationController = require('../controllers/notificationController');
        
        console.log('📝 Complete request received:', {
            id: req.params.id,
            resolution_note,
            updated_by,
            files: req.files ? req.files.length : 0
        });

        if (!resolution_note || resolution_note.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                error: 'กรุณากรอกรายละเอียดการแก้ไข' 
            });
        }

        const complaint = await Complaint.findOne({ complaint_id: req.params.id });
        if (!complaint) {
            return res.status(404).json({ 
                success: false, 
                error: 'ไม่พบเรื่องร้องเรียนนี้' 
            });
        }

        if (complaint.current_status !== 'กำลังดำเนินการ') {
            return res.status(400).json({ 
                success: false, 
                error: 'สามารถเปลี่ยนเป็นเสร็จสิ้นได้เฉพาะเรื่องที่กำลังดำเนินการเท่านั้น' 
            });
        }

        const now = new Date();
        complaint.current_status = 'เสร็จสิ้น';
        complaint.resolution_note = resolution_note.trim();
        complaint.completed_date = now;
        
        let resolutionAttachments = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            resolutionAttachments = req.files.map(file => `/uploads/${file.filename}`);
            console.log('✅ Files uploaded:', resolutionAttachments);
        }
        complaint.resolution_attachments = resolutionAttachments;
        
        const diff = now - complaint.datetime_reported;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        complaint.time_used = `${days} วัน ${hours} ชั่วโมง`;

        complaint.status_history.push({
            status_id: 'S' + Date.now().toString().slice(-7),
            status_name: 'เสร็จสิ้น',
            updated_at: now,
            updated_by: updated_by || 'Staff',
        });

        await complaint.save();

        // 🔔 สร้างการแจ้งเตือน
        await notificationController.createNotification(
            complaint.user_id,
            complaint.complaint_id,
            'completed',
            `เรื่องร้องเรียน "${complaint.title}" ได้รับการแก้ไขเสร็จสิ้นแล้ว`,
            {
                resolution_note: resolution_note.substring(0, 100),
                completed_by: updated_by,
                time_used: complaint.time_used
            }
        );
        
        console.log('✅ Complaint completed successfully');
        
        res.json({ 
            success: true, 
            message: 'เปลี่ยนสถานะเป็นเสร็จสิ้นสำเร็จ', 
            data: complaint 
        });
    } catch (err) {
        console.error('❌ Complete Task Error:', err);
        res.status(500).json({ 
            success: false, 
            error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ',
            details: err.message 
        });
    }
});

module.exports = router;