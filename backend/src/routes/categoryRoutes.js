// backend/src/routes/categoryRoutes.js
// Routes สำหรับจัดการหมวดหมู่เรื่องร้องเรียน
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET: ดึงรายการหมวดหมู่ทั้งหมด
router.get('/', categoryController.getCategories);

// POST: สร้างหมวดหมู่ใหม่
router.post('/', categoryController.createCategory);

// PUT: อัพเดทหมวดหมู่
router.put('/:id', categoryController.updateCategory);

// DELETE: ลบหมวดหมู่
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;