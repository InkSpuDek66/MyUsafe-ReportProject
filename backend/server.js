// ============================================
// FILE: backend/server.js
// (แก้ไขเพิ่มเติม - COPY ทั้งหมด)
// ============================================

// backend/server.js
// ไฟล์หลักของ Backend Application สำหรับระบบรับเรื่องร้องเรียน

const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const oauthRoutes = require('./src/routes/oauth');

// โหลด environment variables จากไฟล์ .env
dotenv.config();
require('./src/config/passport'); // Load Passport Strategies

// Import Routes ทั้งหมด
const authRoutes = require('./src/routes/authRoutes');
const complaintRoutes = require('./src/routes/homeRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

// Import Models
const Complaint = require('./src/models/homeModel');
const { Server } = require('socket.io');

// ✅ Import Routes & Models
const authRoutes = require('./src/routes/auth'); 

// สร้าง Express app และ HTTP server
const app = express();
const server = http.createServer(app);

// ตั้งค่า Socket.IO สำหรับ real-time communication
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

// ทำให้ io เป็น global variable เพื่อใช้งานในไฟล์อื่นๆ
global.io = io;

// ================= เชื่อมต่อ MongoDB ==================
if (process.env.NODE_ENV !== 'test' && mongoose.connection.readyState === 0) {
  mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,})
    .then(() => console.log('🟢 Connected to MongoDB'))
    .catch((err) => console.error('🔴 MongoDB connection error:', err));
}

// ================= Middleware Configuration ===================

// ตั้งค่า CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ตั้งค่า Express middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ เพิ่ม 4 บรรทัดนี้ (MISSING)
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// ✅ เพิ่ม 2 บรรทัดนี้ (MISSING)
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/profile', express.static(path.join(__dirname, 'profile')));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ================= Routes ===================

// ✅ เพิ่มบรรทัดนี้ FIRST (MISSING)
app.use('/', oauthRoutes);

app.use('/auth', authRoutes); 
app.use('/api/complaints', complaintRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ================= Socket.IO Configuration ===================
// เก็บรายการ socket ที่เคยดูเรื่องร้องเรียนแล้ว เพื่อไม่ให้นับซ้ำ
const viewedMap = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // ให้ user เข้าร่วม room ส่วนตัวของตัวเองสำหรับรับ notification
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // เมื่อมีการดูเรื่องร้องเรียน ให้เพิ่ม view count
  socket.on('view_complaint', async (complaintId) => {
    if (!complaintId) return;

    // ตรวจสอบว่า socket นี้เคยดูเรื่องนี้แล้วหรือยัง
    const key = `${socket.id}_${complaintId}`;
    if (viewedMap.has(key)) return;

    // บันทึกว่าดูแล้ว
    viewedMap.set(key, true);

    try {
      const complaint = await Complaint.findOne({ complaint_id: complaintId });
      if (!complaint) return;

      // เพิ่ม view count
      complaint.views = (complaint.views || 0) + 1;
      await complaint.save();

      // แจ้ง client ทุกคนว่า view count เปลี่ยน
      io.emit('update_views', { id: complaintId, views: complaint.views });
    } catch (error) {
      console.error('Socket view_complaint error:', error);
    }
  });

  // เมื่อ socket disconnect ให้ลบข้อมูลการดูออกจาก Map
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    for (const key of viewedMap.keys()) {
      if (key.startsWith(socket.id)) viewedMap.delete(key);
    }
  });
});

// ================= Error Handling ===================

// 404 Handler - จัดการเมื่อไม่พบ route ที่ต้องการ
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.url
  });
});

// Global Error Handler - จัดการ error ทั้งหมด
app.use((err, req, res, next) => {
  console.error('Global Error Handler:');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // จัดการ Multer Error (การอัพโหลดไฟล์)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `Upload Error: ${err.message}`
    });
  }

  // จัดการ Validation Error (การตรวจสอบข้อมูล)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // จัดการ Error อื่นๆ
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// ================= เริ่มต้น Server ===================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
  });
}

// Graceful shutdown - ปิด server อย่างเป็นระเบียบ
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;