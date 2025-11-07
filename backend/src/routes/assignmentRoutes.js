// backend/src/routes/assignmentRoutes.js
// Routes สำหรับจัดการการมอบหมายงานเรื่องร้องเรียนให้เจ้าหน้าที่
// ================================
// Assignment APIs Checklist
// 1. [GET] /api/assignments/staff - ดึงรายชื่อ staff ทั้งหมด (เพิ่มใหม่)
// 2. [POST] /api/assignments/:id/assign - มอบหมายงานให้เจ้าหน้าที่
// 3. [GET] /api/assignments/staff/:staffId - ดึงเรื่องร้องเรียนที่มอบหมายให้เจ้าหน้าที่
// 4. [DELETE] /api/assignments/:id/unassign - ยกเลิกการมอบหมาย
// ================================
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// GET: ดึงรายชื่อ staff ทั้งหมด (เพิ่มใหม่)
router.get('/staff', assignmentController.getAllStaff);

// POST: มอบหมายงานให้เจ้าหน้าที่
router.post('/:id/assign', assignmentController.assignComplaint);

// GET: ดึงเรื่องร้องเรียนที่มอบหมายให้เจ้าหน้าที่
router.get('/staff/:staffId', assignmentController.getAssignedComplaints);

// DELETE: ยกเลิกการมอบหมาย
router.delete('/:id/unassign', assignmentController.unassignComplaint);

module.exports = router;