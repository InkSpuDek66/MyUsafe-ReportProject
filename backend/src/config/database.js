// backend/src/config/database.js
// ใช้สำหรับการเชื่อมต่อกับฐานข้อมูล(mongoDB)
const mongoose = require('mongoose');
require('dotenv').config(); //npm install dotenv โหลดค่า .env
const MONGODB_URI = process.env.MONGODB_URI_MY; // ควรเก็บไว้ใน .env
// เชื่อมต่อกับ MongoDB ด้วย Mongoose แบบ async/await
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = connectDB;