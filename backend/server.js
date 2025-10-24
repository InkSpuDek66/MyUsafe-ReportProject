// backend/server.js
// Main server file for the backend application
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import Routes
const complaintRoutes = require('./src/routes/homeRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');

// Import Models
const Complaint = require('./src/models/homeModel');
// const User = require('./src/models/User');
const { Server } = require('socket.io');
require('dotenv').config(); // ✅ โหลด .env ก่อนใช้ค่าใน process.env

// ✅ Import Routes & Models
const authRoutes = require('./src/routes/auth'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // ✅ เพิ่ม PATCH
  },
});

// ================= MongoDB Connect ==================
if (process.env.NODE_ENV !== 'test' && mongoose.connection.readyState === 0) {
  mongoose
  .connect(process.env.MONGO_URI, { // ✅ ใช้ค่าใน .env
    useNewUrlParser: true,
    useUnifiedTopology: true,})
    .then(() => console.log('🟢 Connected to MongoDB'))
    .catch((err) => console.error('🔴 MongoDB connection error:', err));
}

// ================= Middleware ===================
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ================= Routes ===================
app.use('/auth', authRoutes); 
app.use('/api/complaints', complaintRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/assignments', assignmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ================= Error Handling ===================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.url
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `Upload Error: ${err.message}`
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// ================= Socket.IO ===================
const viewedMap = new Map();

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('view_complaint', async (complaintId) => {
    if (!complaintId) return;

    const key = `${socket.id}_${complaintId}`;
    if (viewedMap.has(key)) return;

    viewedMap.set(key, true);

    try {
      const complaint = await Complaint.findOne({ complaint_id: complaintId });
      if (!complaint) return;

      complaint.views = (complaint.views || 0) + 1;
      await complaint.save();

      io.emit('update_views', { id: complaintId, views: complaint.views });
    } catch (error) {
      console.error('Socket view_complaint error:', error);
    }
  });

  socket.on('disconnect', () => {
    for (const key of viewedMap.keys()) {
      if (key.startsWith(socket.id)) viewedMap.delete(key);
    }
  });
});

// ================= Start Server ===================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
  });
}

// Graceful shutdown
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
