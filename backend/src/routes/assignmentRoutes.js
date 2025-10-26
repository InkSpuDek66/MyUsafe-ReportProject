// backend/src/routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// ✅ GET: ดึงรายชื่อ staff ทั้งหมด (เพิ่มใหม่)
router.get('/staff', assignmentController.getAllStaff);

// POST: มอบหมายงานให้เจ้าหน้าที่
router.post('/:id/assign', assignmentController.assignComplaint);

// GET: ดึงเรื่องร้องเรียนที่มอบหมายให้เจ้าหน้าที่
router.get('/staff/:staffId', assignmentController.getAssignedComplaints);

// DELETE: ยกเลิกการมอบหมาย
router.delete('/:id/unassign', assignmentController.unassignComplaint);

module.exports = router;