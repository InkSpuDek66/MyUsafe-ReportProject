// backend/src/models/notificationModel.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['complaint_submitted', 'status_changed', 'assigned', 'resolved', 'commented'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  complaint_id: {
    type: String,
    index: true
  },
  related_id: {
    type: mongoose.Schema.Types.ObjectId
  },
  is_read: {
    type: Boolean,
    default: false,
    index: true
  },
  action_url: String,
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 2592000 // ลบอัตโนมัติหลังจาก 30 วัน
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);