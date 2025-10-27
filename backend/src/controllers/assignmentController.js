// backend/src/controllers/assignmentController.js
// Controller สำหรับจัดการการมอบหมายงานเรื่องร้องเรียนให้เจ้าหน้าที่
const Complaint = require('../models/homeModel');
const User = require('../models/userModel'); // ✅ เพิ่ม import User model

// 👥 GET: ดึงรายชื่อ staff ทั้งหมด (เพิ่มใหม่)
exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await User.find({ 
            role: 'staff',
            is_active: true 
        }).select('_id name email phone'); // เลือกเฉพาะฟิลด์ที่ต้องการ

        res.json({
            success: true,
            count: staffList.length,
            data: staffList
        });
    } catch (err) {
        console.error('Get Staff List Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเจ้าหน้าที่'
        });
    }
};

// 👤 POST: มอบหมายงานให้เจ้าหน้าที่
exports.assignComplaint = async (req, res) => {
    try {
        const { id } = req.params; // complaint_id
        const { assigned_to, assigned_by } = req.body;

        if (!assigned_to) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุเจ้าหน้าที่ที่จะมอบหมายงาน'
            });
        }

        // ✅ ตรวจสอบว่า staff มีอยู่จริง
        const staff = await User.findById(assigned_to);
        if (!staff || staff.role !== 'staff') {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบเจ้าหน้าที่นี้ในระบบ'
            });
        }

        const complaint = await Complaint.findOne({ complaint_id: id });
        if (!complaint) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบเรื่องร้องเรียนนี้'
            });
        }

        // อัปเดตการมอบหมาย
        complaint.assigned_to = assigned_to;
        complaint.assigned_at = new Date();
        complaint.assigned_by = assigned_by || null;

        // เปลี่ยนสถานะเป็น "กำลังดำเนินการ" ถ้ายังเป็น "รอรับเรื่อง"
        if (complaint.current_status === 'รอรับเรื่อง') {
            complaint.current_status = 'กำลังดำเนินการ';
            complaint.status_history.push({
                status_id: 'S' + Date.now().toString().slice(-7),
                status_name: 'กำลังดำเนินการ',
                updated_at: new Date(),
                updated_by: assigned_by || 'system'
            });
        }

        await complaint.save();

        res.json({
            success: true,
            message: 'มอบหมายงานสำเร็จ',
            data: {
                ...complaint.toObject(),
                assigned_staff: {
                    _id: staff._id,
                    name: staff.name,
                    email: staff.email
                }
            }
        });
    } catch (err) {
        console.error('Assign Complaint Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการมอบหมายงาน'
        });
    }
};

// 📋 GET: ดึงเรื่องร้องเรียนที่มอบหมายให้เจ้าหน้าที่ (แก้ไข)
exports.getAssignedComplaints = async (req, res) => {
    try {
        const { staffId } = req.params;

        const complaints = await Complaint.find({
            assigned_to: staffId
        }).sort({ assigned_at: -1 });

        // ✅ ดึงข้อมูล staff ด้วย
        const staff = await User.findById(staffId).select('name email');

        res.json({
            success: true,
            count: complaints.length,
            staff: staff,
            data: complaints
        });
    } catch (err) {
        console.error('Get Assigned Complaints Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        });
    }
};

// 🔄 DELETE: ยกเลิกการมอบหมาย
exports.unassignComplaint = async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findOne({ complaint_id: id });
        if (!complaint) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบเรื่องร้องเรียนนี้'
            });
        }

        complaint.assigned_to = null;
        complaint.assigned_at = null;
        complaint.assigned_by = null;

        await complaint.save();

        res.json({
            success: true,
            message: 'ยกเลิกการมอบหมายสำเร็จ',
            data: complaint
        });
    } catch (err) {
        console.error('Unassign Complaint Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการยกเลิกการมอบหมาย'
        });
    }
};