// backend/tests/hooks.test.js
// ===============================================
// Global Test Hooks (Lifecycle Management)
// ===============================================
// ไฟล์นี้จัดการ lifecycle ของการทดสอบทั้งหมด:
// - before: ทำงานก่อนเริ่ม tests ทั้งหมด (เชื่อมต่อฐานข้อมูล)
// - afterEach: ทำงานหลังแต่ละ test (ล้างข้อมูล)
// - after: ทำงานหลัง tests ทั้งหมดเสร็จ (ปิดฐานข้อมูล)
// ===============================================

const { connectTestDb, clearAllCollections, closeTestDb } = require('./setup');

/**
 * Before Hook - ทำงานก่อนเริ่ม tests ทั้งหมด
 * เชื่อมต่อกับฐานข้อมูลทดสอบ
 */
before(async function () {
    // เพิ่มเวลา timeout เพราะการเชื่อมต่อฐานข้อมูลอาจใช้เวลานาน
    this.timeout(10000);
    
    try {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 เริ่มต้นการทดสอบระบบ MyUSafe');
        console.log('='.repeat(60));
        
        await connectTestDb();
        
    } catch (error) {
        console.error('🔴 ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', error.message);
        process.exit(1); // ออกจากโปรแกรมถ้าเชื่อมต่อไม่ได้
    }
});

/**
 * AfterEach Hook - ทำงานหลังจากแต่ละ test
 * ล้างข้อมูลทั้งหมดเพื่อให้แต่ละ test เป็นอิสระ
 */
afterEach(async function () {
    // ล้างข้อมูลหลังจากแต่ละ test
    await clearAllCollections();
});

/**
 * After Hook - ทำงานหลังจาก tests ทั้งหมดเสร็จสิ้น
 * ปิดการเชื่อมต่อฐานข้อมูลและลบข้อมูลทดสอบ
 */
after(async function () {
    try {
        console.log('\n' + '='.repeat(60));
        console.log(' การทดสอบเสร็จสิ้น');
        console.log('='.repeat(60));
        
        await closeTestDb();
        
    } catch (error) {
        console.error('🔴 เกิดข้อผิดพลาดในการปิดฐานข้อมูล:', error.message);
    }
});