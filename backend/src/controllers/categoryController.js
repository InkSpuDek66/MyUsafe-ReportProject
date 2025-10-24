// backend/src/controllers/categoryController.js
// Controller สำหรับจัดการหมวดหมู่เรื่องร้องเรียน
const Category = require('../models/categoryModel');

// 📂 GET: ดึงรายการหมวดหมู่ทั้งหมด
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        res.json({
            success: true,
            data: categories
        });
    } catch (err) {
        console.error('Get Categories Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่'
        });
    }
};

// 🆕 POST: เพิ่มหมวดหมู่ใหม่ (Admin only)
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุชื่อหมวดหมู่'
            });
        }

        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                error: 'มีหมวดหมู่นี้อยู่แล้ว'
            });
        }

        const newCategory = new Category({
            name: name.trim(),
            description: description || ''
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: 'เพิ่มหมวดหมู่สำเร็จ',
            data: newCategory
        });
    } catch (err) {
        console.error('Create Category Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่'
        });
    }
};