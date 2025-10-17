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
    const { status, q, category, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Filter by status
    if (status && status !== 'ทั้งหมด') {
      filter.current_status = status;
    }

    // Filter by category (รองรับ single category)
    if (category) {
      filter.categories = category; // ใช้ categories แทน category
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

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments(filter);
    
    const complaints = await Complaint.find(filter)
      .sort({ datetime_reported: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: complaints,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: parseInt(limit)
      }
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

// ✏️ PUT: แก้ไขเรื่องร้องเรียน
exports.updateComplaint = async (req, res) => {
  try {
    const { status, action, set } = req.body;
    
    const complaint = await Complaint.findOne({ 
      complaint_id: req.params.id 
    });
    
    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        error: 'ไม่พบเรื่องร้องเรียนนี้' 
      });
    }

    // อัพเดท Status
    if (status) {
      const now = new Date();
      complaint.current_status = status;
      complaint.status_history.push({
        status_id: genStatusId(),
        status_name: status,
        updated_at: now
      });
      
      if (status === 'เสร็จสิ้น') {
        complaint.completed_date = now;
        
        // คำนวณระยะเวลาที่ใช้
        const timeDiff = now - complaint.datetime_reported;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        complaint.time_used = `${days} วัน ${hours} ชั่วโมง`;
      }
    }

    // อัพเดท Likes/Dislikes/Views
    if (action === 'like') complaint.likes++;
    if (action === 'dislike') complaint.dislikes++;
    if (action === 'view') complaint.views++;

    // อัพเดทฟิลด์อื่นๆ
    if (set && typeof set === 'object') {
      Object.assign(complaint, set);
    }

    await complaint.save();
    
    res.json({
      success: true,
      message: 'อัพเดทเรื่องร้องเรียนสำเร็จ',
      data: complaint
    });
  } catch (err) {
    console.error('Update Complaint Error:', err);
    res.status(500).json({ 
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัพเดท' 
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