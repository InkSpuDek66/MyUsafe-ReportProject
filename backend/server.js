// backend/server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'complaints.json');

app.use(cors());
app.use(express.json());

// helpers
async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}
async function writeData(arr) {
  await fs.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
}
function genComplaintId() {
  // สร้าง id แบบ char(8): 'C' + 7 ตัวเลข (จากเวลา)
  return 'C' + Date.now().toString().slice(-7);
}
function genStatusId() {
  return 'S' + Date.now().toString().slice(-7);
}

// ensure file exists
(async () => {
  try {
    await fs.readFile(DATA_FILE);
  } catch (e) {
    if (e.code === 'ENOENT') {
      await writeData([]); // สร้างไฟล์เริ่มต้น
      console.log('Created empty complaints.json');
    }
  }
})();

// GET list, supports ?status=, ?q=, ?category=
app.get('/api/complaints', async (req, res) => {
  try {
    const { status, q, category } = req.query;
    let list = await readData();
    if (status && status !== 'ทั้งหมด') list = list.filter((r) => r.current_status === status);
    if (category) list = list.filter((r) => r.category === category);
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter(
        (r) =>
          (r.complaint_id && r.complaint_id.toLowerCase().includes(qq)) ||
          (r.description && r.description.toLowerCase().includes(qq)) ||
          (r.title && r.title.toLowerCase().includes(qq)) ||
          (r.location && r.location.toLowerCase().includes(qq))
      );
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
app.get('/api/stats', async (req, res) => {
  try {
    const list = await readData();
    const total = list.length;
    const counts = { 'รอรับเรื่อง': 0, 'ดำเนินการ': 0, 'เสร็จสิ้น': 0 };
    list.forEach((r) => {
      const s = r.current_status || 'รอรับเรื่อง';
      if (counts[s] !== undefined) counts[s] += 1;
    });
    const percentCompleted = total === 0 ? 0 : Math.round((counts['เสร็จสิ้น'] / total) * 100);
    res.json({ total, counts, percentCompleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single complaint by complaint_id
app.get('/api/complaints/:id', async (req, res) => {
  try {
    const list = await readData();
    const c = list.find((x) => String(x.complaint_id) === String(req.params.id));
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new complaint
app.post('/api/complaints', async (req, res) => {
  try {
    const { title, category, description, attachment, user_id, location } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    const list = await readData();
    const now = new Date().toISOString();
    const newC = {
      complaint_id: genComplaintId(),         // char(8) like 'C1234567'
      title,
      category: category || 'ทั่วไป',          // enum-like
      description: description || '',
      datetime_reported: now,
      attachment: attachment || null,         // url or null
      user_id: user_id || 'U0000000',
      location: location || '',
      current_status: 'รอรับเรื่อง',
      status_history: [
        {
          status_id: genStatusId(),
          status_name: 'รอรับเรื่อง',
          updated_at: now,
        },
      ],
      likes: 0,
      dislikes: 0,
      views: 0,
      // optional fields for display
      time_used: '-',
      completed_date: '-',
    };

    // newest first
    list.unshift(newC);
    await writeData(list);
    res.status(201).json(newC);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update complaint (change status, add like/dislike, set fields)
// body can contain: status (string), action ('like'|'dislike'|'view'), set (object) for fields
app.put('/api/complaints/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status, action, set } = req.body;
    const list = await readData();
    const idx = list.findIndex((x) => String(x.complaint_id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    const item = list[idx];

    if (status) {
      const now = new Date().toISOString();
      item.current_status = status;
      item.status_history = item.status_history || [];
      item.status_history.push({
        status_id: genStatusId(),
        status_name: status,
        updated_at: now,
      });
      if (status === 'เสร็จสิ้น') item.completed_date = now;
    }

    if (action === 'like') item.likes = (item.likes || 0) + 1;
    if (action === 'dislike') item.dislikes = (item.dislikes || 0) + 1;
    if (action === 'view') item.views = (item.views || 0) + 1;

    if (set && typeof set === 'object') {
      // allow partial updates: e.g., { time_used: '2 ชม.' }
      Object.assign(item, set);
    }

    list[idx] = item;
    await writeData(list);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE complaint
app.delete('/api/complaints/:id', async (req, res) => {
  try {
    let list = await readData();
    const before = list.length;
    list = list.filter((x) => String(x.complaint_id) !== String(req.params.id));
    if (list.length === before) return res.status(404).json({ error: 'Not found' });
    await writeData(list);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Backend listening on http://localhost:${PORT}`));
