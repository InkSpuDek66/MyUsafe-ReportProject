// backend/tests/setup.js
// ไฟล์ตั้งค่าการทดสอบ - ทำงานก่อนและหลัง tests ทั้งหมด
// ===============================================
// ## 🏃 วิธีรัน Tests
// ### 1. รัน Tests ทั้งหมด
// npm test

// ### 2. รัน Tests แบบ Watch Mode
// npm run test:watch

// ### 3. สร้าง HTML Test Report และเปิดผลลัพธ์ทันที
// npm run test:report && start test-reports\test-report.html
// ==============================================
const mongoose = require('mongoose');
const path = require('path');

// ✅ โหลด .env.test ก่อนอื่น
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

// ✅ เก็บ URI เป็นตัวแปร
const testDbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/MyUSafe_test_db';

async function connectTestDb() {
    // ตรวจสอบและ disconnect connection เดิมถ้ามี
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(testDbUri);
    console.log('\n🟢 เชื่อมต่อกับฐานข้อมูลทดสอบสำเร็จ:', testDbUri);
}

async function clearAllCollections() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}

async function closeTestDb() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('🔴 ปิดการเชื่อมต่อฐานข้อมูลทดสอบแล้ว\n');
}

module.exports = {
    testDbUri,
    connectTestDb,
    clearAllCollections,
    closeTestDb
};