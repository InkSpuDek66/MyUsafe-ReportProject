// backend/src/controllers/homeController.js
// Controller สำหรับจัดการเรื่องร้องเรียน (Complaints)
const Complaint = require('../models/homeModel');

// Helper Functions
function genComplaintId() {
  return 'C' + Date.now().toString().slice(-7);
}

function genStatusId() {
  return 'S' + Date.now().toString().slice(-7);
}

// 📋 GET: ดึงรายการเรื่องร้องเรียนทั้งหมด (มี Filter)
exports.getComplaints = async (req, res) => {
  try {
    const { status, q, category, priority } = req.query; // เอา page, limit ออก
    const filter = {};

    // Filter by status
    if (status && status !== 'ทั้งหมด') {
      filter.current_status = status;
    }

    // Filter by category (รองรับ single category)
    if (category) {
      filter.categories = category;
    }

    // Filter by priority (รองรับ single priority)
    if (priority) {
      filter.priority = priority;
    }

    // Search (title, description, location)
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { complaint_id: regex },
        { title: regex },
        { description: regex },
        { 'location.building': regex },
        { 'location.floor': regex },
        { 'location.room': regex }
      ];
    }

    // ดึงข้อมูลทั้งหมด (ไม่จำกัดจำนวน)
    const complaints = await Complaint.find(filter)
      .sort({ datetime_reported: -1 });

    res.json({
      success: true,
      data: complaints
    });
  } catch (err) {
    console.error('Get Complaints Error:', err);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};


// 📄 GET: ดึงเรื่องร้องเรียนเดียว
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaint_id: req.params.id
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบเรื่องร้องเรียนนี้'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (err) {
    console.error('Get Complaint Error:', err);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

// 🆕 POST: สร้างเรื่องร้องเรียนใหม่ (แก้ไขเพื่อรองรับ multiple categories และ multer)
exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      categories, // เปลี่ยนจาก category เป็น categories
      description,
      user_id,
      location
    } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุหัวข้อ'
      });
    }

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุตำแหน่งที่เกิดเหตุ'
      });
    }

    // Parse location (อาจเป็น JSON string)
    let locationObj;
    try {
      locationObj = typeof location === 'string' ? JSON.parse(location) : location;
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'รูปแบบข้อมูลตำแหน่งไม่ถูกต้อง'
      });
    }

    if (!locationObj.building || !locationObj.floor) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุอาคารและชั้น'
      });
    }

    // Parse categories (อาจเป็น JSON string)
    let categoriesArray = [];
    if (categories) {
      try {
        categoriesArray = typeof categories === 'string' ? JSON.parse(categories) : categories;
        if (!Array.isArray(categoriesArray)) {
          categoriesArray = [categoriesArray];
        }
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'รูปแบบข้อมูลหมวดหมู่ไม่ถูกต้อง'
        });
      }
    }

    if (categoriesArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่'
      });
    }

    const now = new Date();

    // จัดการ attachments จาก multer (req.files)
    let attachArray = [];
    if (req.files && req.files.length > 0) {
      attachArray = req.files.map(file => `/uploads/${file.filename}`);
    }

    const newComplaint = new Complaint({
      complaint_id: genComplaintId(),
      title: title.trim(),
      categories: categoriesArray, // ใช้ categories array
      description: description || '',
      datetime_reported: now,
      attachments: attachArray,
      user_id: user_id || 'U0000000',
      location: {
        building: locationObj.building,
        floor: locationObj.floor,
        room: locationObj.room || ''
      },
      current_status: 'รอรับเรื่อง',
      status_history: [
        {
          status_id: genStatusId(),
          status_name: 'รอรับเรื่อง',
          updated_at: now
        }
      ],
      likes: 0,
      dislikes: 0,
      views: 0,
      time_used: '-',
      completed_date: '-'
    });

    await newComplaint.save();

    res.status(201).json({
      success: true,
      message: 'สร้างเรื่องร้องเรียนสำเร็จ',
      data: newComplaint
    });
  } catch (err) {
    console.error('Create Complaint Error:', err);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการสร้างเรื่องร้องเรียน',
      details: err.message
    });
  }
};

// ✏️ PUT: แก้ไขเรื่องร้องเรียน (อัปเดตสถานะ + บันทึกผู้เปลี่ยน)
exports.updateComplaint = async (req, res) => {
  try {
    const { status, action, set, priority, updated_by } = req.body;

    const complaint = await Complaint.findOne({
      complaint_id: req.params.id
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบเรื่องร้องเรียนนี้'
      });
    }

    // ✅ อัปเดตสถานะ
    if (status) {
      const allowedTransitions = {
        'รอรับเรื่อง': ['กำลังดำเนินการ', 'ยกเลิก'],
        'กำลังดำเนินการ': ['เสร็จสิ้น', 'ยกเลิก'],
        'เสร็จสิ้น': [],
        'ยกเลิก': []
      };

      const currentStatus = complaint.current_status;
      const allowed = allowedTransitions[currentStatus] || [];

      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `ไม่สามารถเปลี่ยนสถานะจาก "${currentStatus}" เป็น "${status}" ได้`,
          allowed_transitions: allowed
        });
      }

      const now = new Date();
      complaint.current_status = status;

      complaint.status_history.push({
        status_id: 'S' + Date.now().toString().slice(-7),
        status_name: status,
        updated_at: now,
        updated_by: updated_by || 'system'
      });

      if (status === 'เสร็จสิ้น') {
        complaint.completed_date = now;

        const timeDiff = now - complaint.datetime_reported;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        complaint.time_used = `${days} วัน ${hours} ชั่วโมง`;
      }
    }

    // ใช้ action เพื่ออัปเดต likes, dislikes, views
    if (action) {
      let updateOperation = {};

      if (action === 'like') {
        updateOperation = { $inc: { likes: 1 } };
      } else if (action === 'dislike') {
        updateOperation = { $inc: { dislikes: 1 } };
      } else if (action === 'view') {
        updateOperation = { $inc: { views: 1 } };
      }

      if (Object.keys(updateOperation).length > 0) {
        // ใช้ findOneAndUpdate แทน save() เพื่อให้เป็น atomic operation
        const updatedComplaint = await Complaint.findOneAndUpdate(
          { complaint_id: req.params.id },
          updateOperation,
          { new: true } // return updated document
        );

        return res.json({
          success: true,
          message: 'อัพเดทเรื่องร้องเรียนสำเร็จ',
          data: updatedComplaint
        });
      }
    }

    // อัพเดท priority
    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (validPriorities.includes(priority)) {
        complaint.priority = priority;
      }
    }

    // อัพเดท fields อื่นๆ จาก set
    if (set && typeof set === 'object') {
      Object.assign(complaint, set);
    }

    await complaint.save();

    res.json({
      success: true,
      message: 'อัปเดตเรื่องร้องเรียนสำเร็จ',
      data: complaint
    });
  } catch (err) {
    console.error('Update Complaint Error:', err);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล'
    });
  }
};

// ✅ PUT: เปลี่ยนสถานะของเรื่องร้องเรียน (Person 3)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_status, updated_by } = req.body;

    // ตรวจสอบสถานะที่ส่งมา
    const allowedStatuses = ['รอรับเรื่อง', 'กำลังดำเนินการ', 'เสร็จสิ้น'];
    if (!allowedStatuses.includes(new_status)) {
      return res.status(400).json({
        success: false,
        error: 'สถานะไม่ถูกต้อง',
      });
    }

    const complaint = await Complaint.findOne({ complaint_id: id });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบเรื่องร้องเรียนนี้',
      });
    }

    const now = new Date();

    complaint.current_status = new_status;
    complaint.status_history.push({
      status_id: 'S' + Date.now().toString().slice(-7),
      status_name: new_status,
      updated_at: now,
      updated_by: updated_by || 'ไม่ระบุ',
    });

    if (new_status === 'เสร็จสิ้น') {
      complaint.completed_date = now;
      const diff = now - complaint.datetime_reported;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      complaint.time_used = `${days} วัน ${hours} ชั่วโมง`;
    }

    await complaint.save();

    res.json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data: complaint,
    });
  } catch (err) {
    console.error('updateComplaintStatus Error:', err);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดระหว่างเปลี่ยนสถานะ',
      details: err.message,
    });
  }
};

// 🗑️ DELETE: ลบเรื่องร้องเรียน
exports.deleteComplaint = async (req, res) => {
  try {
    const result = await Complaint.deleteOne({
      complaint_id: req.params.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบเรื่องร้องเรียนนี้'
      });
    }

    res.json({
      success: true,
      message: 'ลบเรื่องร้องเรียนสำเร็จ'
    });
  } catch (err) {
    console.error('Delete Complaint Error:', err);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบ'
    });
  }
};

