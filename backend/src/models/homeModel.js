// backend/models/homeModel.js
const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  status_id: String,
  status_name: String,
  updated_at: Date,
});

const complaintSchema = new mongoose.Schema({
  complaint_id: String,
  title: String,
  category: String,
  description: String,
  datetime_reported: Date,
  attachments: [String], // ✅ เปลี่ยนจาก attachment → attachments
  user_id: String,
  location: String,
  current_status: String,
  status_history: [statusSchema],
  likes: Number,
  dislikes: Number,
  views: Number,
  time_used: String,
  completed_date: String,
});

module.exports = mongoose.model('Complaint', complaintSchema);
