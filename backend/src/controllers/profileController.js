const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const User = require('../models/userModel');

const profileDir = path.join(__dirname, '../../profile');
if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profileDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = 'profile-' + req.user._id + '-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

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

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

exports.uploadMiddleware = upload.single('profileImage');

// ✅ ฟังก์ชันสำหรับดาวน์โหลดรูป OAuth (Helper function)
const downloadOAuthImageFile = (imageUrl) => {
    return new Promise((resolve, reject) => {
        try {
            const fileName = `profile-oauth-${Date.now()}.jpg`;
            const filePath = path.join(profileDir, fileName);
            const file = fs.createWriteStream(filePath);

            console.log('📥 Downloading OAuth image from:', imageUrl);

            const protocol = imageUrl.startsWith('https') ? https : http;

            protocol.get(imageUrl, (response) => {
                console.log('📡 Response Status:', response.statusCode);

                if (response.statusCode === 301 || response.statusCode === 302) {
                    console.log('🔄 Redirecting to:', response.headers.location);
                    return downloadOAuthImageFile(response.headers.location)
                        .then(resolve)
                        .catch(reject);
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    return;
                }

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    const localUrl = `/profile/${fileName}`;
                    console.log('✅ OAuth image downloaded successfully:', localUrl);
                    resolve(localUrl);
                });

                file.on('error', (err) => {
                    fs.unlink(filePath, () => {});
                    reject(err);
                });
            }).on('error', (err) => {
                fs.unlink(filePath, () => {});
                reject(err);
            });
        } catch (err) {
            console.error('❌ Download error:', err);
            reject(err);
        }
    });
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

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

        const user = await User.findById(userId);
        const oldImageUrl = user.profile_image;

        if (oldImageUrl && oldImageUrl.startsWith('/profile/')) {
            const oldImagePath = path.join(profileDir, path.basename(oldImageUrl));
            if (fs.existsSync(oldImagePath)) {
                try {
                    fs.unlinkSync(oldImagePath);
                    console.log('🗑️ ลบรูปเก่า:', oldImageUrl);
                } catch (err) {
                    console.warn('Could not delete old image:', err.message);
                }
            }
        }

        user.profile_image = newImageUrl;
        await user.save();

        res.json({
            success: true,
            message: 'อัปเดตรูปโปรไฟล์สำเร็จ',
            data: { profile_image: newImageUrl }
        });

    } catch (err) {
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

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone, profile_image } = req.body;

        const updateData = {};

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        if (profile_image && (profile_image.startsWith('http://') || profile_image.startsWith('https://'))) {
            try {
                console.log('📥 Downloading OAuth profile image...');
                const localImageUrl = await downloadOAuthImageFile(profile_image);
                updateData.profile_image = localImageUrl;
            } catch (err) {
                console.warn('⚠️ Failed to download OAuth image:', err.message);
            }
        }

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

exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

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

        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        const isPasswordCorrect = await user.comparePassword(currentPassword);
        
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
            });
        }

        const isSamePassword = await user.comparePassword(newPassword);
        
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                error: 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม'
            });
        }

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

// ✅ ดาวน์โหลดรูป OAuth (API endpoint)
exports.downloadOAuthImage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                error: 'ไม่พบ imageUrl'
            });
        }

        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            return res.status(400).json({
                success: false,
                error: 'URL ไม่ถูกต้อง'
            });
        }

        console.log('📥 Downloading OAuth image:', imageUrl);

        const localImagePath = await downloadOAuthImageFile(imageUrl);

        const user = await User.findByIdAndUpdate(
            userId,
            { profile_image: localImagePath },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'ดาวน์โหลดรูป OAuth สำเร็จ',
            data: {
                profile_image: localImagePath
            }
        });

    } catch (err) {
        console.error('Download OAuth Image Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดาวน์โหลดรูป'
        });
    }
};
exports.downloadOAuthImage