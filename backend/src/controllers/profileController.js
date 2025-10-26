// backend/src/controllers/profileController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/userModel'); // ✅ ใช้ MongoDB User model

// สร้างโฟลเดอร์ profile ถ้ายังไม่มี
const profileDir = path.join(__dirname, '../../profile');
if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
}

// กำหนดที่เก็บไฟล์โปรไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profileDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = 'profile-' + req.user._id + '-' + Date.now() + path.extname(file.originalname);
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

// สร้าง upload middleware สำหรับโปรไฟล์
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

exports.uploadMiddleware = upload.single('profileImage');

// ดึงข้อมูลโปรไฟล์
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user._id; // ✅ MongoDB ใช้ _id
        
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        // แปลงข้อมูลให้ตรงกับที่ frontend ต้องการ
        const profileData = {
            id: user._id,
            name: user.name,
            email: user.email,
            student_id: user.university_id || '',
            phone: user.phone || '',
            role: user.role,
            profile_image: user.profile_image || null,
            created_at: user.created_at
        };

        res.json({
            success: true,
            data: profileData
        });
    } catch (err) {
        console.error('Get Profile Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์'
        });
    }
};

// อัปเดตรูปโปรไฟล์
exports.updateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'ไม่พบไฟล์รูปภาพ'
            });
        }

        const userId = req.user._id;
        const newImageUrl = `/profile/${req.file.filename}`;

        // ดึงรูปเก่า
        const user = await User.findById(userId);
        const oldImageUrl = user.profile_image;

        // อัปเดตรูปใหม่
        user.profile_image = newImageUrl;
        await user.save();

        // ลบรูปเก่า (ถ้ามี)
        if (oldImageUrl) {
            const oldImagePath = path.join(profileDir, path.basename(oldImageUrl));
            if (fs.existsSync(oldImagePath)) {
                try {
                    fs.unlinkSync(oldImagePath);
                } catch (err) {
                    console.warn('Could not delete old image:', err.message);
                }
            }
        }

        res.json({
            success: true,
            message: 'อัปเดตรูปโปรไฟล์สำเร็จ',
            data: { profile_image: newImageUrl }
        });

    } catch (err) {
        // ลบไฟล์ที่อัปโหลดถ้าเกิดข้อผิดพลาด
        if (req.file) {
            const filePath = path.join(profileDir, req.file.filename);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.warn('Could not delete uploaded file:', unlinkErr.message);
                }
            }
        }

        console.error('Update Profile Image Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการอัปเดตรูปโปรไฟล์'
        });
    }
};

// อัปเดตข้อมูลโปรไฟล์
// backend/src/controllers/profileController.js

// ในส่วน updateProfile ให้เหลือแค่นี้:
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone } = req.body; // ✅ เอา student_id ออก

        const updateData = {};

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'ไม่มีข้อมูลที่ต้องการอัปเดต'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'อัปเดตข้อมูลโปรไฟล์สำเร็จ',
            data: user
        });

    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลโปรไฟล์'
        });
    }
};

// เพิ่มฟังก์ชันนี้ใน backend/src/controllers/profileController.js

// อัปเดตรหัสผ่าน
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'
            });
        }

        // ดึงข้อมูลผู้ใช้พร้อมรหัสผ่าน
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        // ตรวจสอบรหัสผ่านปัจจุบัน
        const isPasswordCorrect = await user.comparePassword(currentPassword);
        
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
            });
        }

        // ตรวจสอบว่ารหัสผ่านใหม่ซ้ำกับรหัสผ่านเดิมหรือไม่
        const isSamePassword = await user.comparePassword(newPassword);
        
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                error: 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม'
            });
        }

        // อัปเดตรหัสผ่าน
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'เปลี่ยนรหัสผ่านสำเร็จ'
        });

    } catch (err) {
        console.error('Update Password Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
        });
    }
};