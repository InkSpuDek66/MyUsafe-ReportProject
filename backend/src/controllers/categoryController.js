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

// 🔍 GET: ดึงหมวดหมู่ตาม ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบหมวดหมู่นี้'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (err) {
        console.error('Get Category By ID Error:', err);
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

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุชื่อหมวดหมู่'
            });
        }

        // ✅ ลบการตรวจสอบ auto_assign_dept ออก
        // if (!auto_assign_dept) {
        //     return res.status(400).json({
        //         success: false,
        //         error: 'กรุณาระบุหน่วยงานรับผิดชอบ'
        //     });
        // }

        // ตรวจสอบว่ามีหมวดหมู่ชื่อนี้อยู่แล้วหรือไม่
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                error: 'มีหมวดหมู่นี้อยู่แล้ว'
            });
        }

        // สร้างหมวดหมู่ใหม่
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

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุชื่อหมวดหมู่'
            });
        }

        // ตรวจสอบว่ามีหมวดหมู่ชื่อนี้อยู่แล้วหรือไม่ (ยกเว้นตัวเอง)
        const existingCategory = await Category.findOne({ 
            name: name.trim(),
            _id: { $ne: id }
        });
        
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                error: 'มีหมวดหมู่ชื่อนี้อยู่แล้ว'
            });
        }

        // อัพเดทข้อมูล
        category.name = name.trim();
        category.description = description || '';
        category.icon = icon || '📋';

        await category.save();

        res.json({
            success: true,
            message: 'แก้ไขหมวดหมู่สำเร็จ',
            data: category
        });
    } catch (err) {
        console.error('Update Category Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่'
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

        // ตรวจสอบว่ามีเรื่องร้องเรียนที่ใช้หมวดหมู่นี้อยู่หรือไม่
        const Complaint = require('../models/homeModel');
        const complaintsCount = await Complaint.countDocuments({ category_id: id });
        
        if (complaintsCount > 0) {
            return res.status(400).json({
                success: false,
                error: `ไม่สามารถลบได้ เนื่องจากมีเรื่องร้องเรียน ${complaintsCount} รายการที่ใช้หมวดหมู่นี้อยู่`
            });
        }

        // ลบหมวดหมู่
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

// 🔄 PATCH: เปลี่ยนสถานะการใช้งาน (Admin only)
// ✅ ฟังก์ชันนี้ยังคงไว้เผื่อใช้ในอนาคต แต่ไม่ได้ใช้งานตอนนี้
exports.toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบหมวดหมู่นี้'
            });
        }

        category.is_active = !category.is_active;
        await category.save();

        res.json({
            success: true,
            message: `${category.is_active ? 'เปิด' : 'ปิด'}ใช้งานหมวดหมู่สำเร็จ`,
            data: category
        });
    } catch (err) {
        console.error('Toggle Category Status Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะหมวดหมู่'
        });
    }
};