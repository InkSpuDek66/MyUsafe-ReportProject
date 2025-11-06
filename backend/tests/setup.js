// ==============================================
// backend/tests/setup.js
// ===============================================
// ไฟล์ตั้งค่าการทดสอบ (Test Setup Configuration)
// ===============================================
// ไฟล์นี้จะทำงานก่อนและหลังการรัน tests ทั้งหมด
// เพื่อจัดการการเชื่อมต่อฐานข้อมูลและล้างข้อมูลทดสอบ
//
// วิธีรัน Tests:
// 1. รัน Tests ทั้งหมด:              npm test
// 2. รัน Tests แบบ Watch Mode:      npm run test:watch
// 3. สร้าง HTML Test Report:       npm run test:report
// 4. เปิดผลลัพธ์รายงานทันที:    start test-reports\test-report.html
// ตัวอย่างคำสั่งเต็ม:
// สร้าง HTML Test Report และเปิดผลลัพธ์ทันที
// npm run test:report && start test-reports\test-report.html
// ===============================================

const mongoose = require('mongoose');
const path = require('path');

// ตั้งค่า environment เป็น 'test'
process.env.NODE_ENV = 'test';

// โหลดค่าจากไฟล์ .env.test
require('dotenv').config({ 
    path: path.join(__dirname, '..', '.env.test') 
});

// กำหนด MongoDB URI สำหรับการทดสอบ
const testDbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/MyUSafe_test_db';

/**
 * เชื่อมต่อกับฐานข้อมูลทดสอบ
 * ถ้ามีการเชื่อมต่ออยู่แล้ว จะ disconnect ก่อนแล้วค่อยเชื่อมต่อใหม่
 */
async function connectTestDb() {
    try {
        // ตรวจสอบและ disconnect connection เดิมถ้ามี
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        // เชื่อมต่อกับฐานข้อมูลทดสอบ
        await mongoose.connect(testDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('\n🟢 เชื่อมต่อกับฐานข้อมูลทดสอบสำเร็จ');
        console.log(`📊 Database: ${testDbUri}`);
    } catch (error) {
        console.error('🔴 เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', error.message);
        throw error;
    }
}

/**
 * ล้างข้อมูลในทุก collection ของฐานข้อมูล
 * ใช้หลังจากแต่ละ test เพื่อให้แต่ละ test เป็นอิสระต่อกัน
 */
async function clearAllCollections() {
    try {
        const collections = mongoose.connection.collections;
        const clearPromises = [];

        // ล้างข้อมูลใน collection ทั้งหมด
        for (const key in collections) {
            clearPromises.push(collections[key].deleteMany({}));
        }

        await Promise.all(clearPromises);
        console.log('ล้างข้อมูลทั้งหมดสำเร็จ');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการล้างข้อมูล:', error.message);
        throw error;
    }
}

/**
 * ปิดการเชื่อมต่อฐานข้อมูลและลบฐานข้อมูลทดสอบ
 * ใช้หลังจาก tests ทั้งหมดเสร็จสิ้น
 */
async function closeTestDb() {
    try {
        // ลบฐานข้อมูลทดสอบทั้งหมด
        await mongoose.connection.dropDatabase();
        console.log('🗑️  ลบฐานข้อมูลทดสอบสำเร็จ');
        
        // ปิดการเชื่อมต่อ
        await mongoose.connection.close();
        console.log('🔴 ปิดการเชื่อมต่อฐานข้อมูลแล้ว\n');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการปิดฐานข้อมูล:', error.message);
        throw error;
    }
}

// Export ฟังก์ชันทั้งหมด
module.exports = {
    testDbUri,
    connectTestDb,
    clearAllCollections,
    closeTestDb
};