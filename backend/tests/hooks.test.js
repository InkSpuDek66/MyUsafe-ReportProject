// backend/tests/hooks.test.js
// Global test hooks
const { connectTestDb, clearAllCollections, closeTestDb } = require('./setup');

// เชื่อมต่อก่อน tests ทั้งหมด
before(async function() {
  this.timeout(10000);
  try {
    await connectTestDb();
  } catch (error) {
    console.error('❌ Test database connection error:', error);
    process.exit(1);
  }
});

// ลบข้อมูลหลังแต่ละ test
afterEach(async function() {
  await clearAllCollections();
});

// ปิดการเชื่อมต่อหลัง tests ทั้งหมด
after(async function() {
  try {
    await closeTestDb();
  } catch (error) {
    console.error('Error closing test database:', error);
  }
});