// backend/src/routes/categoryRoutes.js
// Routes สำหรับจัดการหมวดหมู่เรื่องร้องเรียน
// ================================
// Category APIs Checklist
// 1. [GET] /api/categories - ดึงรายการหมวดหมู่ทั้งหมด
// 2. [GET] /api/categories/:id - ดึงหมวดหมู่ตาม ID
// 3. [POST] /api/categories - เพิ่มหมวดหมู่ใหม่
// 4. [PUT] /api/categories/:id - แก้ไขหมวดหมู่ ✅ เพิ่มใหม่
// 5. [DELETE] /api/categories/:id - ลบหมวดหมู่ ✅ เพิ่มใหม่
// 6. [PATCH] /api/categories/:id/toggle - เปลี่ยนสถานะการใช้งาน (ถ้าต้องการใช้ในอนาคต)
// ================================
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET: ดึงรายการหมวดหมู่ทั้งหมด
router.get('/', categoryController.getCategories);

// GET: ดึงหมวดหมู่ตาม ID
router.get('/:id', categoryController.getCategoryById);

// POST: เพิ่มหมวดหมู่ใหม่
router.post('/', categoryController.createCategory);

// PUT: แก้ไขหมวดหมู่ ✅ เพิ่มใหม่
router.put('/:id', categoryController.updateCategory);

// DELETE: ลบหมวดหมู่ ✅ เพิ่มใหม่
router.delete('/:id', categoryController.deleteCategory);

// PATCH: เปลี่ยนสถานะการใช้งาน (ถ้าต้องการใช้ในอนาคต)
router.patch('/:id/toggle', categoryController.toggleCategoryStatus);

module.exports = router;