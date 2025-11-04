// backend/src/controllers/commentController.js
// Controller สำหรับจัดการความคิดเห็นในเรื่องร้องเรียน

const Comment = require('../models/commentModel');
const Complaint = require('../models/homeModel');

// ===================================
// GET: ดึงความคิดเห็นทั้งหมดของเรื่องร้องเรียน
// ===================================
exports.getCommentsByComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;

        // ค้นหาความคิดเห็นทั้งหมดของเรื่องร้องเรียนนี้
        const comments = await Comment.find({ complaint_id: complaintId })
            .sort({ created_at: -1 });

        res.json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (err) {
        console.error('Get Comments Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลความคิดเห็น'
        });
    }
};

// ===================================
// POST: เพิ่มความคิดเห็นใหม่
// ===================================
exports.addComment = async (req, res) => {
    try {
        const { complaint_id, user_id, user_name, user_role, comment } = req.body;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!complaint_id || !user_id || !user_name || !comment || comment.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }

        // ตรวจสอบว่าเรื่องร้องเรียนมีอยู่จริง
        const complaint = await Complaint.findOne({ complaint_id });
        if (!complaint) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบเรื่องร้องเรียนนี้'
            });
        }

        // สร้างความคิดเห็นใหม่
        const newComment = new Comment({
            complaint_id,
            user_id,
            user_name,
            user_role: user_role || 'reporter',
            comment: comment.trim()
        });

        await newComment.save();

        res.status(201).json({
            success: true,
            message: 'เพิ่มความคิดเห็นสำเร็จ',
            data: newComment
        });
    } catch (err) {
        console.error('Create Comment Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการสร้างความคิดเห็น'
        });
    }
};

// ===================================
// PUT: แก้ไขความคิดเห็น
// ===================================
exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, user_id, user_role } = req.body;

        // ตรวจสอบว่ามีข้อความความคิดเห็น
        if (!comment || comment.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกความคิดเห็น'
            });
        }

        // ค้นหาความคิดเห็นที่ต้องการแก้ไข
        const existingComment = await Comment.findById(id);
        if (!existingComment) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบความคิดเห็นนี้'
            });
        }

        // ตรวจสอบสิทธิ์ (เฉพาะเจ้าของหรือ admin)
        if (user_id && existingComment.user_id !== user_id && user_role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'คุณไม่มีสิทธิ์แก้ไขความคิดเห็นนี้'
            });
        }

        // อัพเดทความคิดเห็น
        existingComment.comment = comment.trim();
        existingComment.is_edited = true;
        existingComment.updated_at = new Date();

        await existingComment.save();

        res.json({
            success: true,
            message: 'แก้ไขความคิดเห็นสำเร็จ',
            data: existingComment
        });
    } catch (err) {
        console.error('Update Comment Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการแก้ไขความคิดเห็น'
        });
    }
};

// ===================================
// DELETE: ลบความคิดเห็น
// ===================================
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.query.user_id || req.body?.user_id;
        const user_role = req.query.user_role || req.body?.user_role;

        // ค้นหาความคิดเห็นที่ต้องการลบ
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบความคิดเห็นนี้'
            });
        }

        // ตรวจสอบสิทธิ์ (เฉพาะเจ้าของหรือ admin)
        if (user_id && comment.user_id !== user_id && user_role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'คุณไม่มีสิทธิ์ลบความคิดเห็นนี้'
            });
        }

        // ลบความคิดเห็น
        await Comment.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'ลบความคิดเห็นสำเร็จ',
            data: comment
        });
    } catch (err) {
        console.error('Delete Comment Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการลบความคิดเห็น'
        });
    }
};