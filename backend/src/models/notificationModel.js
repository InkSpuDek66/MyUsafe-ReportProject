// backend/src/models/notificationModel.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    complaint_id: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "status_change",
        "assigned",
        "comment",
        "completed",
        "cancelled",
        "created",
      ], // ✅ มีแค่ 'created' ก็พอ
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      default: {},
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true,
    },
    read_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Index สำหรับ query ที่ใช้บ่อย
notificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
