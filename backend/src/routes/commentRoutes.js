// backend/src/routes/commentRoutes.js
// Routes สำหรับจัดการความคิดเห็น

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// GET: ดึงความคิดเห็นทั้งหมดของเรื่องร้องเรียนนั้นๆ
router.get('/complaint/:complaintId', commentController.getCommentsByComplaint);

// POST: เพิ่มความคิดเห็นใหม่
router.post('/', commentController.addComment);

// PUT: แก้ไขความคิดเห็น
router.put('/:id', commentController.updateComment);

// DELETE: ลบความคิดเห็น
router.delete('/:id', commentController.deleteComment);

module.exports = router;