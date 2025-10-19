// backend/src/controllers/assignmentController.js
// Controller สำหรับจัดการการมอบหมายงาน
const Complaint = require('../models/homeModel');

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
                updated_at: new Date()
            });
        }

        await complaint.save();

        res.json({
            success: true,
            message: 'มอบหมายงานสำเร็จ',
            data: complaint
        });
    } catch (err) {
        console.error('Assign Complaint Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการมอบหมายงาน'
        });
    }
};

// 📋 GET: ดึงเรื่องร้องเรียนที่มอบหมายให้เจ้าหน้าที่
exports.getAssignedComplaints = async (req, res) => {
    try {
        const { staffId } = req.params;

        const complaints = await Complaint.find({
            assigned_to: staffId
        }).sort({ assigned_at: -1 });

        res.json({
            success: true,
            count: complaints.length,
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