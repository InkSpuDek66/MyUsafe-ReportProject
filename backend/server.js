// backend/server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config(); // ✅ โหลด .env ก่อนใช้ค่าใน process.env

// ✅ Import Routes & Models
const authRoutes = require('./src/routes/auth'); 
const complaintRoutes = require('./src/routes/homeRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // ถ้า frontend รันที่ Vite ใช้ port 5173
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const PORT = process.env.PORT || 5000;

// ================= MongoDB Connect ==================
mongoose
  .connect(process.env.MONGO_URI, { // ✅ ใช้ค่าใน .env
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('🟢 Connected to MongoDB Atlas'))
  .catch((err) => console.error('🔴 MongoDB connection error:', err));

// ================= Middleware ===================
app.use(cors());
app.use(express.json());

// ================= Routes ===================
app.use('/auth', authRoutes); 
app.use('/api/complaints', complaintRoutes);

// ================= Socket.IO ===================
const viewedMap = new Map();

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('view_complaint', async (complaintId) => {
    if (!complaintId) return;

    const key = `${socket.id}_${complaintId}`;
    if (viewedMap.has(key)) return;

    viewedMap.set(key, true);
    const c = await Complaint.findOne({ complaint_id: complaintId });
    if (!c) return;

    c.views = (c.views || 0) + 1;
    await c.save();

    io.emit('update_views', { id: complaintId, views: c.views });
  });

  socket.on('disconnect', () => {
    for (const key of viewedMap.keys()) {
      if (key.startsWith(socket.id)) viewedMap.delete(key);
    }
  });
});

// ================= Start Server ===================
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
