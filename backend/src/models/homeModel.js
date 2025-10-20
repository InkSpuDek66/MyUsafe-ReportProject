// backend/src/models/homeModel.js
// Mongoose model สำหรับเรื่องร้องเรียน (Complaints)
const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  status_id: String,
  status_name: {
    type: String,
    enum: ['รอรับเรื่อง', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก']
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  // ✅ เพิ่มฟิลด์นี้
  updated_by: {
    type: String,
    default: 'system'
  }
});

const complaintSchema = new mongoose.Schema({
  complaint_id: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  categories: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr && arr.length > 0;
      },
      message: 'ต้องมีอย่างน้อย 1 หมวดหมู่'
    }
  },
  description: {
    type: String,
    default: ''
  },
  datetime_reported: {
    type: Date,
    default: Date.now
  },
  attachments: [String],

  user_id: {
    type: String,
    required: true,
    index: true
  },

  location: {
    building: {
      type: String,
      required: true
    },
    floor: {
      type: String,
      required: true
    },
    room: {
      type: String,
      default: ''
    }
  },

  current_status: {
    type: String,
    enum: ['รอรับเรื่อง', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'],
    default: 'รอรับเรื่อง',
    index: true
  },

  // ✅ ใช้ statusSchema ที่เพิ่ม updated_by แล้ว
  status_history: [statusSchema],

  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },

  time_used: {
    type: String,
    default: '-'
  },
  completed_date: {
    type: String,
    default: '-'
  }
}, {
  timestamps: true // เพิ่ม createdAt และ updatedAt อัตโนมัติ
});

module.exports = mongoose.model('Complaint', complaintSchema);
