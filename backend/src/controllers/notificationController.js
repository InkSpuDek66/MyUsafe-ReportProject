// backend/src/controllers/notificationController.js
const Notification = require('../models/notificationModel');

// GET: ดึงแจ้งเตือน
exports.getNotifications = async (req, res) => {
  try {
    const { unread_only = false, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const query = { recipient_id: req.user._id };
    if (unread_only === 'true') {
      query.is_read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);
    const unread_count = await Notification.countDocuments({
      recipient_id: req.user._id,
      is_read: false
    });

    res.json({
      success: true,
      data: notifications,
      unread_count,
      pagination: {
        current_page: Number(page),
        total_pages: Math.ceil(total / limit),
        total,
        per_page: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH: ทำให้เป็นอ่านแล้ว
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH: ทำให้ทั้งหมดเป็นอ่านแล้ว
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient_id: req.user._id, is_read: false },
      { is_read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE: ลบแจ้งเตือน
exports.deleteNotification = async (req, res) => {
  try {
    const result = await Notification.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};