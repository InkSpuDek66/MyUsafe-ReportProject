// backend/src/controllers/notificationController.js
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// 📬 สร้างการแจ้งเตือนใหม่
// backend/src/controllers/notificationController.js

// 📬 สร้างการแจ้งเตือนใหม่
exports.createNotification = async (userId, complaintId, type, message, data = {}) => {
    try {
        console.log('📬 Creating notification:', { 
            userId, 
            complaintId, 
            type, 
            message: message.substring(0, 50) + '...'
        }); // ✅ เพิ่ม log

        const notification = new Notification({
            user_id: userId,
            complaint_id: complaintId,
            type: type,
            message: message,
            data: data,
            is_read: false
        });
        
        await notification.save();
        console.log('✅ Notification saved to DB:', notification._id); // ✅ เพิ่ม log
        
        // ส่ง Socket.IO event
        const io = global.io;
        if (io) {
            console.log('🔌 Emitting socket event to room:', userId); // ✅ เพิ่ม log
            io.to(userId).emit('new_notification', notification.toObject());
            console.log('✅ Socket event emitted'); // ✅ เพิ่ม log
        } else {
            console.warn('⚠️ Socket.IO not available'); // ✅ เพิ่ม warning
        }
        
        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        throw error;
    }
};

// 📋 ดึงการแจ้งเตือนทั้งหมดของ user
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user?.user_id || req.params.userId;
        const { unread_only, limit = 20 } = req.query;
        
        const query = { user_id: userId };
        if (unread_only === 'true') {
            query.is_read = false;
        }
        
        const notifications = await Notification.find(query)
            .sort({ created_at: -1 })
            .limit(parseInt(limit));
        
        const unreadCount = await Notification.countDocuments({
            user_id: userId,
            is_read: false
        });
        
        res.json({
            success: true,
            data: notifications,
            unread_count: unreadCount
        });
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน'
        });
    }
};

// 📖 อ่านการแจ้งเตือน
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.user_id || req.body.user_id;
        
        const notification = await Notification.findOneAndUpdate(
            { _id: id, user_id: userId },
            { is_read: true, read_at: new Date() },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบการแจ้งเตือนนี้'
            });
        }
        
        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark as Read Error:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาด'
        });
    }
};

// 📖 อ่านทั้งหมด
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.user_id || req.body.user_id;
        
        await Notification.updateMany(
            { user_id: userId, is_read: false },
            { is_read: true, read_at: new Date() }
        );
        
        res.json({
            success: true,
            message: 'อ่านการแจ้งเตือนทั้งหมดแล้ว'
        });
    } catch (error) {
        console.error('Mark All as Read Error:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาด'
        });
    }
};

// 🗑️ ลบการแจ้งเตือน
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.user_id || req.body.user_id;
        
        const result = await Notification.deleteOne({
            _id: id,
            user_id: userId
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบการแจ้งเตือนนี้'
            });
        }
        
        res.json({
            success: true,
            message: 'ลบการแจ้งเตือนสำเร็จ'
        });
    } catch (error) {
        console.error('Delete Notification Error:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาด'
        });
    }
};

module.exports = exports;
