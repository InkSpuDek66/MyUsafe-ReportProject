// backend/src/models/commentModel.js
// Model สำหรับความคิดเห็นในเรื่องร้องเรียน
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    complaint_id: {
        type: String,
        required: true,
        index: true // เพิ่ม index เพื่อค้นหาเร็วขึ้น
    },
    user_id: {
        type: String,
        required: true,
        index: true
    },
    user_name: {
        type: String,
        required: true // ชื่อผู้แสดงความคิดเห็น
    },
    user_role: {
        type: String,
        enum: ['admin', 'staff', 'reporter'],
        default: 'reporter'
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 2500 // กำหนดความยาวสูงสุดของความคิดเห็น
    },
    images: {
        type: [String], // URLs ของรูปภาพแนบ (optional)
        default: []
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    is_edited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // เพิ่ม createdAt และ updatedAt อัตโนมัติ
});

// Index compound สำหรับค้นหาเร็วขึ้น
commentSchema.index({ complaint_id: 1, created_at: -1 });

module.exports = mongoose.model('Comment', commentSchema);