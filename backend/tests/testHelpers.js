// backend/tests/testHelpers.js
// ไฟล์ช่วยเหลือสำหรับการทดสอบ
const request = require('supertest');
const app = require('../server');
const User = require('../src/models/userModel');

/**
 * สร้างผู้ใช้ทดสอบและ login เพื่อเอา token
 */
async function createAuthenticatedUser() {
    // ข้อมูลผู้ใช้ทดสอบ
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `test_${Date.now()}@test.com`,
        password: 'Test1234',
        phone: '0812345678'
    };

    // สมัครสมาชิก
    const signupRes = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

    // ตรวจสอบว่าสมัครสำเร็จ
    if (signupRes.status !== 201) {
        throw new Error(`Signup failed: ${JSON.stringify(signupRes.body)}`);
    }

    // เอา token และ user id
    const token = signupRes.body.token;
    const userId = signupRes.body.data.user._id;

    return { token, userId, user: testUser };
}

/**
 * สร้าง Authorization header สำหรับใช้ใน request
 */
function getAuthHeader(token) {
    return `Bearer ${token}`;
}

/**
 * ล้างข้อมูลผู้ใช้ทดสอบทั้งหมด
 */
async function clearTestUsers() {
    await User.deleteMany({ email: /test_.*@test\.com/ });
}

module.exports = {
    createAuthenticatedUser,
    getAuthHeader,
    clearTestUsers
};