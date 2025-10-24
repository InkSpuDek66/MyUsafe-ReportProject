// backend/src/controllers/commentController.js
// Controller สำหรับจัดการความคิดเห็น
const Comment = require('../models/commentModel');
const Complaint = require('../models/homeModel');

// ความยาวสูงสุดของความคิดเห็น
const MAX_COMMENT_LENGTH = 2500;

// GET: ดึงความคิดเห็นทั้งหมดของเรื่องร้องเรียน
exports.getCommentsByComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;

        // ตรวจสอบว่ามีเรื่องร้องเรียนนี้หรือไม่
        const complaint = await Complaint.findOne({ complaint_id: complaintId });
        if (!complaint) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบเรื่องร้องเรียนนี้'
            });
        }

        // ดึงความคิดเห็นทั้งหมด เรียงจากเก่าไปใหม่
        const comments = await Comment.find({ complaint_id: complaintId })
            .sort({ created_at: 1 }); // เรียงจากเก่าสุดไปใหม่สุด

        res.json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (err) {
        console.error('Get Comments Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงความคิดเห็น'
        });
    }
};

// POST: เพิ่มความคิดเห็นใหม่
exports.addComment = async (req, res) => {
    try {
        const { complaint_id, user_id, user_name, user_role, comment, images } = req.body;

        // Validation
        if (!complaint_id || !comment || comment.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุเรื่องร้องเรียนและความคิดเห็น'
            });
        }

        // เพิ่ม validation ความยาว
        if (comment.length > MAX_COMMENT_LENGTH) {
            return res.status(400).json({
                success: false,
                error: `ความคิดเห็นต้องไม่เกิน ${MAX_COMMENT_LENGTH} ตัวอักษร (ปัจจุบัน: ${comment.length})`,
                details: `ความยาวปัจจุบัน: ${comment.length} ตัวอักษร, เกินไป: ${comment.length - MAX_COMMENT_LENGTH} ตัวอักษร`
            });
        }

        if (!user_id || !user_name) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุข้อมูลผู้ใช้'
            });
        }

        // ตรวจสอบว่ามีเรื่องร้องเรียนนี้หรือไม่
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
            comment: comment.trim(),
            images: images || [],
            created_at: new Date(),
            updated_at: new Date()
        });

        await newComment.save();

        res.status(201).json({
            success: true,
            message: 'เพิ่มความคิดเห็นสำเร็จ',
            data: newComment
        });
    } catch (err) {
        console.error('Add Comment Error:', err);
        
        // ปรับปรุง error handling
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'ข้อมูลไม่ถูกต้อง',
                details: Object.values(err.errors).map(e => e.message).join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น',
            details: err.message
        });
    }
};

// PUT: แก้ไขความคิดเห็น
exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, user_id } = req.body;

        if (!comment || comment.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุความคิดเห็น'
            });
        }

        // เพิ่ม validation ความยาว
        if (comment.length > MAX_COMMENT_LENGTH) {
            return res.status(400).json({
                success: false,
                error: `ความคิดเห็นต้องไม่เกิน ${MAX_COMMENT_LENGTH} ตัวอักษร (ปัจจุบัน: ${comment.length})`
            });
        }

        const existingComment = await Comment.findById(id);
        if (!existingComment) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบความคิดเห็นนี้'
            });
        }

        // ตรวจสอบว่าเป็นเจ้าของความคิดเห็นหรือไม่
        if (existingComment.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                error: 'คุณไม่มีสิทธิ์แก้ไขความคิดเห็นนี้'
            });
        }

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

// DELETE: ลบความคิดเห็น
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบความคิดเห็นนี้'
            });
        }

        // ตรวจสอบว่าเป็นเจ้าของหรือ admin
        if (comment.user_id !== user_id && req.body.user_role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'คุณไม่มีสิทธิ์ลบความคิดเห็นนี้'
            });
        }

        await Comment.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'ลบความคิดเห็นสำเร็จ'
        });
    } catch (err) {
        console.error('Delete Comment Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการลบความคิดเห็น'
        });
    }
};