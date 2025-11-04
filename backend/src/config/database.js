// backend/src/config/database.js
// ไฟล์สำหรับการเชื่อมต่อกับฐานข้อมูล MongoDB

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI_MY;

// ===================================
// เชื่อมต่อกับ MongoDB
// ===================================
const connectDB = async () => {
    try {
        // เชื่อมต่อกับ MongoDB (ไม่ต้องใส่ useNewUrlParser และ useUnifiedTopology อีกต่อไป)
        await mongoose.connect(MONGODB_URI);
        console.log('🟢 Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;