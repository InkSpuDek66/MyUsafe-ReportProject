// backend/src/services/notificationService.js
const Notification = require('../models/notificationModel');

// Helper: Create notification
const createNotification = async (recipientId, notificationData) => {
  try {
    const notification = await Notification.create({
      recipient_id: recipientId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      complaint_id: notificationData.complaint_id,
      action_url: notificationData.action_url || null
    });
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
};

// Function 1: เมื่อผู้ใช้สร้าง Complaint ใหม่
exports.notifyComplaintSubmitted = async (userId, complaint) => {
  return createNotification(userId, {
    type: 'complaint_submitted',
    title: '📝 เรื่องร้องเรียนใหม่',
    message: `คุณได้ส่งเรื่องร้องเรียน: "${complaint.title}" เรียบร้อยแล้ว`,
    complaint_id: complaint.complaint_id,
    action_url: `/complaints/${complaint.complaint_id}`
  });
};

// Function 2: เมื่อสถานะเปลี่ยน
exports.notifyStatusChanged = async (userId, complaint, oldStatus, newStatus) => {
  return createNotification(userId, {
    type: 'status_changed',
    title: '🔄 สถานะเปลี่ยนแปลง',
    message: `เรื่อง "${complaint.title}" เปลี่ยนเป็น: ${newStatus}`,
    complaint_id: complaint.complaint_id,
    action_url: `/complaints/${complaint.complaint_id}`
  });
};

// Function 3: เมื่อ Admin มอบหมายงานให้ Staff
exports.notifyAssigned = async (staffId, complaint, adminName) => {
  return createNotification(staffId, {
    type: 'assigned',
    title: '📌 มีงานมอบหมาย',
    message: `คุณได้รับมอบหมายเรื่อง: "${complaint.title}" จาก ${adminName}`,
    complaint_id: complaint.complaint_id,
    action_url: `/complaints/${complaint.complaint_id}`
  });
};

// Function 4: เมื่อเสร็จสิ้น
exports.notifyResolved = async (userId, complaint) => {
  return createNotification(userId, {
    type: 'resolved',
    title: '✅ แก้ไขเรียบร้อย',
    message: `เรื่องร้องเรียน "${complaint.title}" ได้รับการแก้ไขเรียบร้อยแล้ว`,
    complaint_id: complaint.complaint_id,
    action_url: `/complaints/${complaint.complaint_id}`
  });
};

// Function 5: เมื่อมีความเห็นใหม่
exports.notifyCommented = async (userId, complaint, commenterName) => {
  return createNotification(userId, {
    type: 'commented',
    title: '💬 มีความเห็นใหม่',
    message: `${commenterName} ได้แสดงความเห็นในเรื่อง "${complaint.title}"`,
    complaint_id: complaint.complaint_id,
    action_url: `/complaints/${complaint.complaint_id}`
  });
};