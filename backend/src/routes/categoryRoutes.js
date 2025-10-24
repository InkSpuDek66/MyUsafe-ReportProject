// backend/src/routes/categoryRoutes.js
// Routes สำหรับจัดการหมวดหมู่เรื่องร้องเรียน
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);

module.exports = router;