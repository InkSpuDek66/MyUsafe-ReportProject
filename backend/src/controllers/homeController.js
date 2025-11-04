// backend/src/controllers/homeController.js
// Controller สำหรับจัดการเรื่องร้องเรียน (Complaints)
const Complaint = require("../models/homeModel");
const User = require("../models/userModel");
const notificationController = require("./notificationController");

// Helper Functions
function genComplaintId() {
  return "C" + Date.now().toString().slice(-7);
}

function genStatusId() {
  return "S" + Date.now().toString().slice(-7);
}

// GET: ดึงรายการเรื่องร้องเรียนทั้งหมด (มี Filter และ Pagination)
exports.getComplaints = async (req, res) => {
  try {
    const { status, q, category, priority, page, limit } = req.query;
    const filter = {};

    if (status && status !== "ทั้งหมด") {
      filter.current_status = status;
    }

    // Filter by category
    if (category) {
      filter.categories = category;
    }

    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { complaint_id: regex },
        { title: regex },
        { description: regex },
        { "location.building": regex },
        { "location.floor": regex },
        { "location.room": regex },
      ];
    }

    // Pagination
    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const totalItems = await Complaint.countDocuments(filter);
      const complaints = await Complaint.find(filter)
        .sort({ datetime_reported: -1 })
        .skip(skip)
        .limit(limitNum);

      res.json({
        success: true,
        data: complaints,
        pagination: {
          current_page: pageNum,
          items_per_page: limitNum,
          total_items: totalItems,
          total_pages: Math.ceil(totalItems / limitNum)
        }
      });
    } else {
      // ดึงข้อมูลทั้งหมด (ไม่จำกัดจำนวน)
      const complaints = await Complaint.find(filter)
        .sort({ datetime_reported: -1 });

      res.json({
        success: true,
        data: complaints
      });
    }
  } catch (err) {
    console.error("Get Complaints Error:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};


// GET: ดึงเรื่องร้องเรียนเดียว
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaint_id: req.params.id,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบเรื่องร้องเรียนนี้",
      });
    }

    res.json({
      success: true,
      data: complaint,
    });
  } catch (err) {
    console.error("Get Complaint Error:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};

// POST: สร้างเรื่องร้องเรียนใหม่
// ใช้ req.user จาก protect middleware แทน req.body.user_id
exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      categories,
      description,
      location
    } = req.body;

    // Validation: ตรวจสอบว่ามีหัวข้อ
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุหัวข้อ",
      });
    }

    // Validation: ตรวจสอบว่ามีตำแหน่ง
    if (!location) {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุตำแหน่งที่เกิดเหตุ",
      });
    }

    let locationObj;
    try {
      locationObj =
        typeof location === "string" ? JSON.parse(location) : location;
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: "รูปแบบข้อมูลตำแหน่งไม่ถูกต้อง",
      });
    }

    // Validation: ตรวจสอบว่ามีอาคารและชั้น
    if (!locationObj.building || !locationObj.floor) {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุอาคารและชั้น",
      });
    }

    // Parse categories
    let categoriesArray = [];
    if (categories) {
      try {
        categoriesArray =
          typeof categories === "string" ? JSON.parse(categories) : categories;
        if (!Array.isArray(categoriesArray)) {
          categoriesArray = [categoriesArray];
        }
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "รูปแบบข้อมูลหมวดหมู่ไม่ถูกต้อง",
        });
      }
    }

    // Validation: ต้องมีอย่างน้อย 1 หมวดหมู่
    if (!categoriesArray || categoriesArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุอย่างน้อย 1 หมวดหมู่'
      });
    }

    // รับ URL รูปภาพจาก multer (ถ้ามี)
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // สร้าง ID เรื่องร้องเรียน
    const complaintId = genComplaintId();

    // ดึง user_id จาก req.user (จาก protect middleware)
    // แปลงเป็น string เพราะ Complaint model เก็บเป็น string
    const userId = req.user._id.toString();

    // สร้าง status_history เริ่มต้น
    const statusHistory = [{
      status_id: genStatusId(),
      status_name: 'รอรับเรื่อง',
      updated_at: new Date(),
      updated_by: userId
    }];

    // สร้างเรื่องร้องเรียนใหม่
    const newComplaint = await Complaint.create({
      complaint_id: complaintId,
      title,
      categories: categoriesArray,
      description,
      images,
      location: locationObj,
      current_status: 'รอรับเรื่อง',
      priority: 'low',
      status_history: statusHistory,
      user_id: userId,
      datetime_reported: new Date(),
      likes: 0,
      dislikes: 0,
      views: 0,
      liked_by: [],
      disliked_by: []
    });

    // 🔔 แจ้งเตือน User ที่ส่งเรื่อง
    if (userId && userId !== "U0000000") {
      console.log("🔔 Creating notification for user:", userId);
      await notificationController.createNotification(
        userId,
        newComplaint.complaint_id,
        "created",
        `เรื่องร้องเรียน "${newComplaint.title}" ของคุณถูกส่งเรียบร้อยแล้ว`,
        {
          complaint_id: newComplaint.complaint_id,
          title: newComplaint.title,
          status: "รอรับเรื่อง",
        }
      );
    }

    // 🔔 แจ้งเตือนทุก Admin
    try {
      const admins = await User.find({ role: "admin", is_active: true });
      console.log(`🔔 Found ${admins.length} admins to notify`);

      // ✅ เพิ่ม log เพื่อดูข้อมูล admin
      admins.forEach((admin) => {
        console.log("👤 Admin data:", {
          _id: admin._id,
          user_id: admin.user_id,
          email: admin.email,
          role: admin.role,
        });
      });

      if (admins.length === 0) {
        console.warn("⚠️ No admins found in database!");
      }

      for (const admin of admins) {
        // ✅ ใช้ _id ถ้าไม่มี user_id
        const adminUserId = admin.user_id || admin._id.toString();

        console.log(`🔔 Creating notification for admin: ${adminUserId}`);

        await notificationController.createNotification(
          adminUserId, // ✅ ใช้ตัวแปรที่มี fallback
          newComplaint.complaint_id,
          "created",
          `เรื่องร้องเรียนใหม่: "${newComplaint.title}" จาก User ${
            userId || "ไม่ระบุ"
          }`,
          {
            complaint_id: newComplaint.complaint_id,
            title: newComplaint.title,
            user_id: userId,
            categories: categoriesArray,
            location: `${locationObj.building} ชั้น ${locationObj.floor}`,
            for_admin: true,
          }
        );

        console.log(`✅ Notification created for admin: ${adminUserId}`);
      }
      console.log("✅ All admin notifications created");
    } catch (notifError) {
      console.error("❌ Error creating admin notifications:", notifError);
      console.error("❌ Full error:", notifError.message);
    }

    // ✅ สร้างแจ้งเตือนเมื่อผู้ใช้ส่งเรื่องร้องเรียนใหม่
    try {
      await notifyComplaintSubmitted(user_id, newComplaint);
      console.log('✅ Notification sent for complaint submitted');
    } catch (notifyErr) {
      console.error('⚠️ Error sending notification:', notifyErr.message);
      // ไม่หยุดการสร้าง complaint แม้ notification ล้มเหลว
    }

    res.status(201).json({
      success: true,
      message: "สร้างเรื่องร้องเรียนสำเร็จ",
      data: newComplaint,
    });
  } catch (err) {
    console.error("Create Complaint Error:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการสร้างเรื่องร้องเรียน",
      details: err.message,
    });
  }
};

// PUT: แก้ไขเรื่องร้องเรียน (อัปเดตสถานะ + บันทึกผู้เปลี่ยน)
exports.updateComplaint = async (req, res) => {
  try {
    const { status, action, set, priority, updated_by, assigned_to } = req.body;

    const complaint = await Complaint.findOne({
      complaint_id: req.params.id,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบเรื่องร้องเรียนนี้",
      });
    }

    const oldStatus = complaint.current_status;

    // อัปเดตสถานะ
    if (status) {
      const allowedTransitions = {
        รอรับเรื่อง: ["กำลังดำเนินการ", "ยกเลิก"],
        กำลังดำเนินการ: ["เสร็จสิ้น", "ยกเลิก"],
        เสร็จสิ้น: [],
        ยกเลิก: [],
      };

      const currentStatus = complaint.current_status;
      const allowed = allowedTransitions[currentStatus] || [];

      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `ไม่สามารถเปลี่ยนสถานะจาก "${currentStatus}" เป็น "${status}" ได้`,
          allowed_transitions: allowed,
        });
      }

      const now = new Date();
      complaint.current_status = status;

      complaint.status_history.push({
        status_id: "S" + Date.now().toString().slice(-7),
        status_name: status,
        updated_at: now,
        updated_by: updated_by || "system",
      });

      if (status === "เสร็จสิ้น") {
        complaint.completed_date = now;
        const timeDiff = now - complaint.datetime_reported;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        complaint.time_used = `${days} วัน ${hours} ชั่วโมง`;
      }

      // สร้างการแจ้งเตือนเมื่อเปลี่ยนสถานะ
      if (status !== oldStatus) {
        let notifMessage = '';
        let notifType = 'status_change';

        if (status === 'กำลังดำเนินการ') {
          notifMessage = `เรื่องร้องเรียน "${complaint.title}" กำลังดำเนินการโดยเจ้าหน้าที่`;
        } else if (status === 'เสร็จสิ้น') {
          notifMessage = `เรื่องร้องเรียน "${complaint.title}" ได้รับการจัดการเสร็จสิ้นแล้ว ใช้เวลา ${complaint.time_used}`;
          notifType = 'completed';
        } else if (status === 'ยกเลิก') {
          notifMessage = `เรื่องร้องเรียน "${complaint.title}" ถูกยกเลิก`;
          notifType = 'cancelled';
        } else {
          notifMessage = `เรื่องร้องเรียน "${complaint.title}" เปลี่ยนสถานะเป็น "${status}"`;
        }

        console.log('Creating notification from updateComplaint:', {
          user_id: complaint.user_id,
          type: notifType,
          message: notifMessage
        });

        await notificationController.createNotification(
          complaint.user_id,
          complaint.complaint_id,
          notifType,
          notifMessage,
          {
            old_status: oldStatus,
            new_status: status,
            updated_by: updated_by,
            time_used: complaint.time_used,
          }
        );
      }
    }

    // ใช้ action เพื่ออัปเดต likes, dislikes, views
    if (action) {
      // ใช้ user_id จาก req.user ถ้ามี, ไม่งั้นใช้จาก req.body
      const userId = req.user ? req.user._id.toString() : (req.body.user_id || 'U0000000');

      if (action === 'like') {
        const alreadyLiked = complaint.liked_by.includes(userId);
        const alreadyDisliked = complaint.disliked_by.includes(userId);

        if (alreadyLiked) {
          // ยกเลิก like
          complaint.likes = Math.max(0, complaint.likes - 1);
          complaint.liked_by = complaint.liked_by.filter((id) => id !== userId);
        } else {
          // เพิ่ม like
          complaint.likes += 1;
          complaint.liked_by.push(userId);

          if (alreadyDisliked) {
            complaint.dislikes = Math.max(0, complaint.dislikes - 1);
            complaint.disliked_by = complaint.disliked_by.filter(
              (id) => id !== userId
            );
          }
        }
      } else if (action === "dislike") {
        const alreadyDisliked = complaint.disliked_by.includes(userId);
        const alreadyLiked = complaint.liked_by.includes(userId);

        if (alreadyDisliked) {
          // ยกเลิก dislike
          complaint.dislikes = Math.max(0, complaint.dislikes - 1);
          complaint.disliked_by = complaint.disliked_by.filter(
            (id) => id !== userId
          );
        } else {
          // เพิ่ม dislike
          complaint.dislikes += 1;
          complaint.disliked_by.push(userId);

          if (alreadyLiked) {
            complaint.likes = Math.max(0, complaint.likes - 1);
            complaint.liked_by = complaint.liked_by.filter(
              (id) => id !== userId
            );
          }
        }
      } else if (action === 'view') {
        // เพิ่มจำนวนการเข้าชม
        complaint.views = (complaint.views || 0) + 1;
      }

      await complaint.save();

      return res.json({
        success: true,
        message: "อัพเดทสำเร็จ",
        data: complaint,
      });
    }

    if (priority) {
      const validPriorities = ["low", "medium", "high", "urgent"];
      if (validPriorities.includes(priority)) {
        complaint.priority = priority;
      }
    }

    if (set && typeof set === "object") {
      Object.assign(complaint, set);
    }

    await complaint.save();

    res.json({
      success: true,
      message: "อัปเดตเรื่องร้องเรียนสำเร็จ",
      data: complaint,
    });
  } catch (err) {
    console.error("Update Complaint Error:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
    });
  }
};

// PUT: เปลี่ยนสถานะของเรื่องร้องเรียน (Person 3)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_status, updated_by } = req.body;

    const allowedStatuses = ["รอรับเรื่อง", "กำลังดำเนินการ", "เสร็จสิ้น"];
    if (!allowedStatuses.includes(new_status)) {
      return res.status(400).json({
        success: false,
        error: "สถานะไม่ถูกต้อง",
      });
    }

    const complaint = await Complaint.findOne({ complaint_id: id });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบเรื่องร้องเรียนนี้",
      });
    }

    const oldStatus = complaint.current_status;
    const now = new Date();

    complaint.current_status = new_status;
    complaint.status_history.push({
      status_id: "S" + Date.now().toString().slice(-7),
      status_name: new_status,
      updated_at: now,
      updated_by: updated_by || "ไม่ระบุ",
    });

    if (new_status === "เสร็จสิ้น") {
      complaint.completed_date = now;
      const diff = now - complaint.datetime_reported;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      complaint.time_used = `${days} วัน ${hours} ชั่วโมง`;
    }

    await complaint.save();

    // สร้างการแจ้งเตือน
    const notifType = new_status === 'เสร็จสิ้น' ? 'completed' : 'status_change';
    await notificationController.createNotification(
      complaint.user_id,
      complaint.complaint_id,
      notifType,
      `เรื่องร้องเรียน "${complaint.title}" เปลี่ยนสถานะเป็น "${new_status}"`,
      {
        old_status: oldStatus,
        new_status: new_status,
        updated_by: updated_by,
      }
    );

    res.json({
      success: true,
      message: "อัปเดตสถานะสำเร็จ",
      data: complaint,
    });
  } catch (err) {
    console.error("updateComplaintStatus Error:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดระหว่างเปลี่ยนสถานะ",
      details: err.message,
    });
  }
};

// DELETE: ลบเรื่องร้องเรียน
exports.deleteComplaint = async (req, res) => {
  try {
    const result = await Complaint.deleteOne({
      complaint_id: req.params.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบเรื่องร้องเรียนนี้",
      });
    }

    res.json({
      success: true,
      message: "ลบเรื่องร้องเรียนสำเร็จ",
    });
  } catch (err) {
    console.error("Delete Complaint Error:", err);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการลบ",
    });
  }
};