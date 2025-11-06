// backend/tests/testHelpers.js
// ===============================================
// ไฟล์ช่วยเหลือสำหรับการทดสอบ (Test Helpers)
// ===============================================
// ไฟล์นี้ประกอบด้วยฟังก์ชันช่วยเหลือที่ใช้ในการทดสอบ
// เพื่อลดการเขียนโค้ดซ้ำและทำให้การทดสอบง่ายขึ้น

const request = require('supertest');
const app = require('../server');
const User = require('../src/models/userModel');

/**
 * สร้างผู้ใช้ทดสอบและทำการ login เพื่อรับ authentication token
 * 
 * @returns {Promise<Object>} ข้อมูลผู้ใช้ที่สร้างสำเร็จ
 * @returns {string} token - JWT token สำหรับการยืนยันตัวตน
 * @returns {string} userId - ID ของผู้ใช้ที่สร้าง
 * @returns {Object} user - ข้อมูลผู้ใช้
 */
async function createAuthenticatedUser() {
    // สร้างข้อมูลผู้ใช้ทดสอบแบบสุ่ม (ใช้ timestamp เพื่อไม่ให้ซ้ำ)
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `test_${Date.now()}@test.com`, // ใช้ timestamp เพื่อหลีกเลี่ยงการซ้ำ
        password: 'Test1234',
        phone: '0812345678'
    };

    console.log('📝 กำลังสร้างผู้ใช้ทดสอบ:', testUser.email);

    try {
        // สมัครสมาชิก (แก้ไข route จาก /api/auth/signup เป็น /auth/signup)
        const signupRes = await request(app)
            .post('/auth/signup')
            .send(testUser);

        // ตรวจสอบว่าการสมัครสำเร็จหรือไม่
        if (signupRes.status !== 201) {
            console.error('การสมัครสมาชิกล้มเหลว:', signupRes.body);
            throw new Error(`Signup failed: ${JSON.stringify(signupRes.body)}`);
        }

        console.log(' สร้างผู้ใช้ทดสอบสำเร็จ');

        // ดึง token และ user id จาก response
        const token = signupRes.body.token;
        const userId = signupRes.body.data?.user?._id || signupRes.body.data?._id;

        return { token, userId, user: testUser };
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างผู้ใช้ทดสอบ:', error.message);
        throw error;
    }
}

/**
 * สร้าง Authorization header สำหรับใช้ใน HTTP request
 * 
 * @param {string} token - JWT token
 * @returns {string} Authorization header ในรูปแบบ "Bearer <token>"
 */
function getAuthHeader(token) {
    return `Bearer ${token}`;
}

/**
 * ล้างข้อมูลผู้ใช้ทดสอบทั้งหมดออกจากฐานข้อมูล
 * ใช้ regex pattern เพื่อหาผู้ใช้ที่มี email ขึ้นต้นด้วย "test_"
 * 
 * @returns {Promise<void>}
 */
async function clearTestUsers() {
    try {
        const result = await User.deleteMany({ email: /test_.*@test\.com/ });
        console.log(`ล้างผู้ใช้ทดสอบออก ${result.deletedCount} รายการ`);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการล้างข้อมูล:', error.message);
    }
}

// Export ฟังก์ชันทั้งหมดเพื่อใช้ในไฟล์ทดสอบอื่นๆ
module.exports = {
    createAuthenticatedUser,
    getAuthHeader,
    clearTestUsers
};