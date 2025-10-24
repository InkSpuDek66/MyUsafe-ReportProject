// backend/src/routes/assignmentRoutes.js
// Routes สำหรับจัดการการมอบหมายงาน
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// POST: มอบหมายงานให้เจ้าหน้าที่
router.post('/:id/assign', assignmentController.assignComplaint);

// GET: ดึงเรื่องร้องเรียนที่มอบหมายให้เจ้าหน้าที่
router.get('/staff/:staffId', assignmentController.getAssignedComplaints);

// DELETE: ยกเลิกการมอบหมาย
router.delete('/:id/unassign', assignmentController.unassignComplaint);

module.exports = router;