// backend/controllers/homeController.js
const Complaint = require('../models/homeModel');

function genComplaintId() {
  return 'C' + Date.now().toString().slice(-7);
}
function genStatusId() {
  return 'S' + Date.now().toString().slice(-7);
}

// 📋 GET: All complaints
exports.getComplaints = async (req, res) => {
  try {
    const { status, q, category } = req.query;
    const filter = {};

    if (status && status !== 'ทั้งหมด') filter.current_status = status;
    if (category) filter.category = category;
    if (q) {
      const regex = new RegExp(q, 'i');
      Object.assign(filter, {
        $or: [
          { complaint_id: regex },
          { title: regex },
          { description: regex },
          { location: regex },
        ],
      });
    }

    const list = await Complaint.find(filter).sort({ datetime_reported: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 GET: Single complaint
exports.getComplaintById = async (req, res) => {
  try {
    const c = await Complaint.findOne({ complaint_id: req.params.id });
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🆕 POST: New complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, category, description, attachments, user_id, location } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    const now = new Date();

    // ✅ รองรับทั้ง string เดี่ยวและ array
    const attachArray = Array.isArray(attachments)
      ? attachments
      : attachments
      ? [attachments]
      : [];

    const newComplaint = new Complaint({
      complaint_id: genComplaintId(),
      title,
      category: category || 'ทั่วไป',
      description: description || '',
      datetime_reported: now,
      attachments: attachArray,
      user_id: user_id || 'U0000000',
      location: location || '',
      current_status: 'รอรับเรื่อง',
      status_history: [
        { status_id: genStatusId(), status_name: 'รอรับเรื่อง', updated_at: now },
      ],
      likes: 0,
      dislikes: 0,
      views: 0,
      time_used: '-',
      completed_date: '-',
    });

    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ PUT: Update complaint
exports.updateComplaint = async (req, res) => {
  try {
    const { status, action, set } = req.body;
    const c = await Complaint.findOne({ complaint_id: req.params.id });
    if (!c) return res.status(404).json({ error: 'Not found' });

    if (status) {
      const now = new Date();
      c.current_status = status;
      c.status_history.push({
        status_id: genStatusId(),
        status_name: status,
        updated_at: now,
      });
      if (status === 'เสร็จสิ้น') c.completed_date = now;
    }

    if (action === 'like') c.likes++;
    if (action === 'dislike') c.dislikes++;
    if (action === 'view') c.views++;

    if (set && typeof set === 'object') Object.assign(c, set);

    await c.save();
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ DELETE: Complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const result = await Complaint.deleteOne({ complaint_id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
