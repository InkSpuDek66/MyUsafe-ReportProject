// backend/server.js
// ไฟล์หลักของ Backend Server
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// สร้าง Express app
const app = express();

// ================================
// Middleware Configuration
// ================================

// CORS - อนุญาตให้ Frontend เรียกใช้ API
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body Parser - แปลง JSON และ URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files - สำหรับเสิร์ฟไฟล์รูปภาพที่อัพโหลด
app.use('/uploads', express.static('uploads'));

// ================================
// Database Connection
// ================================

const connectDB = async () => {
    try {
        // ใช้ MONGODB_URI จาก environment variable
        const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/MyUSafe_db';
        
        await mongoose.connect(dbUri);
        
        console.log('✅ เชื่อมต่อ MongoDB สำเร็จ:', dbUri);
    } catch (error) {
        console.error('❌ เชื่อมต่อ MongoDB ล้มเหลว:', error.message);
        // ไม่ exit ในโหมด test
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

// เชื่อมต่อ database (ยกเว้นถ้าอยู่ในโหมด test จะให้ test suite เป็นคนจัดการ)
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// ================================
// Routes Registration
// ================================

// Import routes (ไฟล์อยู่ในโฟลเดอร์เดียวกัน)
const authRoutes = require('./src/routes/authRoutes');
const homeRoutes = require('./src/routes/homeRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

// Register routes
app.use('/api/auth', authRoutes);              // Authentication routes
app.use('/api/complaints', homeRoutes);        // Complaints routes
app.use('/api/locations', locationRoutes);     // Locations routes
app.use('/api/categories', categoryRoutes);    // Categories routes
app.use('/api/comments', commentRoutes);       // Comments routes
app.use('/api/assignments', assignmentRoutes); // Assignments routes
app.use('/api/notifications', notificationRoutes); // Notifications routes
app.use('/api/profile', profileRoutes);        // Profile routes
app.use('/api/upload', uploadRoutes);          // Upload routes

// ================================
// Health Check Endpoint
// ================================

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'MyUSafe Backend API',
        version: '1.0.0',
        status: 'running'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// ================================
// Error Handling Middleware
// ================================

// 404 Handler - จัดการ routes ที่ไม่พบ
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path
    });
});

// Global Error Handler - จัดการ errors ทั้งหมด
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ================================
// Server Start
// ================================

// เริ่มต้น server เฉพาะเมื่อไม่ได้อยู่ในโหมด test
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => {
        console.log(`🚀 Server กำลังทำงานที่ port ${PORT}`);
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Export app สำหรับใช้ใน testing
module.exports = app;