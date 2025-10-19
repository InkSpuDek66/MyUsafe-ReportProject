// backend/tests/hooks.test.js
// Global test hooks สำหรับการตั้งค่าและจัดการข้อมูลทดสอบ
const { connectTestDb, clearAllCollections, closeTestDb } = require('./setup');

// เชื่อมต่อฐานข้อมูลทดสอบก่อนเริ่ม tests ทั้งหมด
before(async function() {
  this.timeout(10000);
  try {
    await connectTestDb();
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูลทดสอบ:', error);
    process.exit(1);
  }
});

// ลบข้อมูลในทุก collection หลังแต่ละ test
afterEach(async function() {
  await clearAllCollections();
});

// ปิดการเชื่อมต่อฐานข้อมูลทดสอบหลังเสร็จสิ้น tests ทั้งหมด
after(async function() {
  try {
    await closeTestDb();
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการปิดฐานข้อมูลทดสอบ:', error);
  }
});