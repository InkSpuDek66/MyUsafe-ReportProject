// backend/src/controllers/categoryController.js
// Controller สำหรับจัดการหมวดหมู่เรื่องร้องเรียน
const Category = require('../models/categoryModel');

// GET: ดึงรายการหมวดหมู่ทั้งหมด
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

// POST: เพิ่มหมวดหมู่ใหม่ (Admin only)
exports.createCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;

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
            description: description || '',
            icon: icon || 'default-icon'
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

// PUT: อัพเดทหมวดหมู่ (Admin only)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon } = req.body;

        // หา category ที่ต้องการอัพเดท
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบหมวดหมู่นี้'
            });
        }

        // ตรวจสอบว่าชื่อซ้ำหรือไม่ (ถ้ามีการเปลี่ยนชื่อ)
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name: name.trim() });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    error: 'มีหมวดหมู่นี้อยู่แล้ว'
                });
            }
            category.name = name.trim();
        }

        // อัพเดทฟิลด์อื่นๆ
        if (description !== undefined) {
            category.description = description;
        }
        if (icon !== undefined) {
            category.icon = icon;
        }

        await category.save();

        res.json({
            success: true,
            message: 'อัพเดทหมวดหมู่สำเร็จ',
            data: category
        });
    } catch (err) {
        console.error('Update Category Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการอัพเดทหมวดหมู่'
        });
    }
};

// DELETE: ลบหมวดหมู่ (Admin only)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // หา category ที่ต้องการลบ
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบหมวดหมู่นี้'
            });
        }

        await Category.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'ลบหมวดหมู่สำเร็จ',
            data: category
        });
    } catch (err) {
        console.error('Delete Category Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการลบหมวดหมู่'
        });
    }
};