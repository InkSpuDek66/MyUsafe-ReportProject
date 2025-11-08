// backend/src/controllers/assignmentController.js
// Controller สำหรับจัดการการมอบหมายงานเรื่องร้องเรียนให้เจ้าหน้าที่
const Complaint = require('../models/homeModel');
const User = require('../models/userModel');
const notificationController = require('./notificationController');

// 👥 GET: ดึงรายชื่อ staff ทั้งหมด
exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await User.find({ 
            role: 'staff',
            is_active: true 
        }).select('_id name email phone');

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
        const { id } = req.params;
        const { assigned_to, assigned_by } = req.body;

        console.log('🎯 Assignment Request:', { id, assigned_to, assigned_by });

        if (!assigned_to) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุเจ้าหน้าที่ที่จะมอบหมายงาน'
            });
        }

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

        complaint.assigned_to = assigned_to;
        complaint.assigned_at = new Date();
        complaint.assigned_by = assigned_by || null;

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
        console.log('✅ Complaint assigned successfully');

        // 🔔 แจ้งเตือนผู้แจ้ง
        console.log('🔔 Creating notification for reporter:', complaint.user_id);
        const reporterNotif = await notificationController.createNotification(
            complaint.user_id,
            complaint.complaint_id,
            'assigned',
            `เรื่องร้องเรียน "${complaint.title}" ได้รับมอบหมายให้เจ้าหน้าที่แล้ว`,
            {
                staff_id: staff._id,
                staff_name: staff.name,
                assigned_by: assigned_by
            }
        );
        console.log('✅ Reporter notification created:', reporterNotif._id);

        // 🔔 แจ้งเตือน Staff ที่ได้รับมอบหมาย
        console.log('🔔 Creating notification for staff:', staff._id.toString());
        const staffNotif = await notificationController.createNotification(
            staff._id.toString(),
            complaint.complaint_id,
            'assigned',
            `คุณได้รับมอบหมายงาน: "${complaint.title}"`,
            {
                complaint_title: complaint.title,
                assigned_by: assigned_by
            }
        );
        console.log('✅ Staff notification created:', staffNotif._id);

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
        console.error('❌ Assign Complaint Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการมอบหมายงาน',
            details: err.message
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

// 🔄 DELETE: ยกเลิกการมอบหมาย + เปลี่ยนสถานะกลับเป็น "รอรับเรื่อง" + แจ้งเตือน Staff
exports.unassignComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🔄 Unassign request received for complaint_id:', id);

        const complaint = await Complaint.findOne({ complaint_id: id });
        
        if (!complaint) {
            console.error('❌ Complaint not found:', id);
            return res.status(404).json({
                success: false,
                error: 'ไม่พบเรื่องร้องเรียนนี้'
            });
        }

        console.log('✅ Complaint found:', {
            complaint_id: complaint.complaint_id,
            current_status: complaint.current_status,
            assigned_to: complaint.assigned_to
        });

        // เก็บข้อมูล staff เดิมไว้สำหรับแจ้งเตือน
        const oldStaffId = complaint.assigned_to;

        // ตรวจสอบว่ามีการมอบหมายอยู่จริงหรือไม่
        if (!oldStaffId) {
            console.warn('⚠️ Complaint is not assigned to anyone');
            return res.status(400).json({
                success: false,
                error: 'เรื่องนี้ยังไม่ได้มอบหมายให้ใคร'
            });
        }

        // ✅ ดึงข้อมูล Staff ก่อนลบการมอบหมาย เพื่อใช้ในการแจ้งเตือน
        let staffInfo = null;
        try {
            staffInfo = await User.findById(oldStaffId).select('user_id name email');
            console.log('👤 Staff info retrieved:', {
                _id: staffInfo?._id,
                user_id: staffInfo?.user_id,
                name: staffInfo?.name
            });
        } catch (err) {
            console.warn('⚠️ Could not retrieve staff info:', err.message);
        }

        // ล้างการมอบหมาย
        complaint.assigned_to = null;
        complaint.assigned_at = null;
        complaint.assigned_by = null;

        // ✅ เปลี่ยนสถานะกลับเป็น "รอรับเรื่อง" ถ้าอยู่ใน "กำลังดำเนินการ"
        if (complaint.current_status === 'กำลังดำเนินการ') {
            console.log('🔄 Changing status back to รอรับเรื่อง');
            complaint.current_status = 'รอรับเรื่อง';
            complaint.status_history.push({
                status_id: 'S' + Date.now().toString().slice(-7),
                status_name: 'รอรับเรื่อง',
                updated_at: new Date(),
                updated_by: 'system',
                note: 'ยกเลิกการมอบหมาย'
            });
        }

        await complaint.save();
        console.log('✅ Complaint saved successfully');

        // ✅ สร้าง notification ก่อนส่ง response (ไม่ใช่ async)
        const notifications = [];

        // 🔔 แจ้งเตือนผู้แจ้ง
        if (complaint.user_id && complaint.user_id !== 'U0000000') {
            try {
                const reporterNotif = await notificationController.createNotification(
                    complaint.user_id,
                    complaint.complaint_id,
                    'status_change',
                    `เรื่องร้องเรียน "${complaint.title}" ถูกยกเลิกการมอบหมาย กลับสู่สถานะรอรับเรื่อง`,
                    {
                        old_status: 'กำลังดำเนินการ',
                        new_status: 'รอรับเรื่อง'
                    }
                );
                notifications.push({ type: 'reporter', id: reporterNotif._id });
                console.log('✅ Reporter notification created:', reporterNotif._id);
            } catch (notifErr) {
                console.error('⚠️ Error creating reporter notification:', notifErr.message);
            }
        }

        // 🔔 แจ้งเตือน Staff ที่ถูกยกเลิกการมอบหมาย
        if (staffInfo && oldStaffId !== 'U0000000') {
            try {
                // ✅ ใช้ user_id จาก User document แทน _id
                const staffUserId = staffInfo.user_id || staffInfo._id.toString();
                console.log('📤 Sending notification to staff user_id:', staffUserId);

                const staffNotif = await notificationController.createNotification(
                    staffUserId,  // ✅ ใช้ user_id แทน _id
                    complaint.complaint_id,
                    'unassigned',
                    `งาน "${complaint.title}" ของคุณถูกยกเลิกการมอบหมาย`,
                    {
                        complaint_title: complaint.title,
                        staff_name: staffInfo.name,
                        new_status: 'รอรับเรื่อง'
                    }
                );
                notifications.push({ type: 'staff', id: staffNotif._id });
                console.log('✅ Staff unassign notification created:', staffNotif._id);

                // ✅ ตรวจสอบว่า Socket.IO emit สำเร็จหรือไม่
                const io = global.io;
                if (io) {
                    console.log('🔌 Emitting to room:', staffUserId);
                    io.to(staffUserId).emit('new_notification', staffNotif.toObject());
                    console.log('✅ Socket event emitted to staff');
                } else {
                    console.error('❌ Socket.IO not available!');
                }
            } catch (notifErr) {
                console.error('⚠️ Error creating staff notification:', notifErr.message);
            }
        }

        // ส่ง response พร้อมข้อมูล notifications ที่สร้างแล้ว
        res.json({
            success: true,
            message: 'ยกเลิกการมอบหมายสำเร็จ สถานะกลับเป็น "รอรับเรื่อง"',
            data: complaint,
            notifications: notifications  // ✅ ส่งข้อมูล notifications กลับไปด้วย
        });

        console.log('✅ Unassign completed successfully with', notifications.length, 'notifications');

    } catch (err) {
        console.error('❌ Unassign Complaint Error:', err);
        console.error('❌ Error stack:', err.stack);
        
        // ถ้ายังไม่ได้ส่ง response ให้ส่งตอนนี้
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'เกิดข้อผิดพลาดในการยกเลิกการมอบหมาย',
                details: err.message
            });
        }
    }
};