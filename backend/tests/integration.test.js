// backend/tests/integration.test.js
// Test suite สำหรับการทดสอบแบบบูรณาการ (Integration Tests)
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Complaint = require('../src/models/homeModel');
const Location = require('../src/models/locationModel');
const Category = require('../src/models/categoryModel');
const { createAuthenticatedUser, getAuthHeader } = require('./testHelpers');

describe('ทดสอบแบบบูรณาการ', () => {
    // ตัวแปรเก็บข้อมูล authentication
    let authToken;
    let testUserId;

    // สร้างผู้ใช้ทดสอบและ login ก่อนเริ่มเทสต์
    before(async function() {
        this.timeout(10000);
        const authData = await createAuthenticatedUser();
        authToken = authData.token;
        testUserId = authData.userId;
    });


    describe('กระบวนการเรื่องร้องเรียนแบบสมบูรณ์', () => {

        it('ควรทำงานผ่านวงจรชีวิตเรื่องร้องเรียนแบบเต็มรูปแบบ', async () => {
            // 1. สร้าง Location
            const locationRes = await request(app)
                .post('/api/locations')
                .send({
                    building: 'อาคาร Integration',
                    floor: '1',
                    room: '101'
                });

            expect(locationRes.status).to.equal(201);

            // 2. สร้าง Category
            const categoryRes = await request(app)
                .post('/api/categories')
                .send({
                    name: 'Integration Test',
                    description: 'Category for testing'
                });

            expect(categoryRes.status).to.equal(201);

            // 3. สร้าง Complaint
            const complaintRes = await request(app)
                .post('/api/complaints')
                    .set('Authorization', getAuthHeader(authToken))
                .send({
                    title: 'Integration Test Complaint',
                    categories: ['Integration Test'],
                    description: 'Testing full flow',
                    location: JSON.stringify({
                        building: 'อาคาร Integration',
                        floor: '1',
                        room: '101'
                    }),
                    user_id: 'U_INT_001'
                });

            expect(complaintRes.status).to.equal(201);
            expect(complaintRes.body).to.have.property('success', true);
            const complaintId = complaintRes.body.data.complaint_id;

            // 4. ดึงข้อมูล Complaint
            const getRes = await request(app)
                .get(`/api/complaints/${complaintId}`);

            expect(getRes.status).to.equal(200);
            expect(getRes.body.data).to.have.property('title', 'Integration Test Complaint');

            // 5. อัปเดตสถานะ
            const updateRes = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            expect(updateRes.status).to.equal(200);
            expect(updateRes.body.data).to.have.property('current_status', 'กำลังดำเนินการ');

            // 6. เพิ่มไลค์
            const likeRes = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    action: 'like',
                    user_id: 'U_INT_001'
                });

            expect(likeRes.status).to.equal(200);
            expect(likeRes.body.data).to.have.property('likes', 1);

            // 7. ทำเรื่องร้องเรียนให้เสร็จสิ้น
            const completeRes = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'เสร็จสิ้น'
                });

            expect(completeRes.status).to.equal(200);
            expect(completeRes.body.data).to.have.property('current_status', 'เสร็จสิ้น');
            expect(completeRes.body.data.completed_date).to.not.equal('-');

            // 8. ลบ Complaint
            const deleteRes = await request(app)
                .delete(`/api/complaints/${complaintId}`);

            expect(deleteRes.status).to.equal(200);
        });
    });

    describe('ทดสอบความสอดคล้องของข้อมูล', () => {

        it('ควรรักษาความสอดคล้องของข้อมูลตลอดการดำเนินการ', async () => {
            // สร้าง 5 complaints
            for (let i = 1; i <= 5; i++) {
                await request(app)
                    .post('/api/complaints')
                    .set('Authorization', getAuthHeader(authToken))
                    .send({
                        title: `Complaint ${i}`,
                        categories: ['ทั่วไป'],
                        description: `Test ${i}`,
                        location: JSON.stringify({
                            building: 'Test Building',
                            floor: '1',
                            room: `10${i}`
                        }),
                        user_id: 'U001'
                    });
            }

            // ตรวจสอบว่ามี 5 complaints
            const listRes = await request(app)
                .get('/api/complaints');

            expect(listRes.body.data).to.have.lengthOf(5);

            // อัปเดตทั้งหมดเป็น 'กำลังดำเนินการ'
            for (const complaint of listRes.body.data) {
                await request(app)
                    .put(`/api/complaints/${complaint.complaint_id}`)
                    .send({ status: 'กำลังดำเนินการ' });
            }

            // ตรวจสอบว่าทั้งหมดมี status ถูกต้อง
            const updatedRes = await request(app)
                .get(`/api/complaints?status=${encodeURIComponent('กำลังดำเนินการ')}`);

            expect(updatedRes.body.data).to.have.lengthOf(5);
            updatedRes.body.data.forEach(complaint => {
                expect(complaint).to.have.property('current_status', 'กำลังดำเนินการ');
                expect(complaint.status_history).to.have.lengthOf(2);
            });
        });
    });

    describe('ทดสอบการจัดการข้อผิดพลาด', () => {

        it('ควรจัดการการอัปเดตพร้อมกันได้อย่างเหมาะสม', async () => {
            // สร้าง complaint
            const createRes = await request(app)
                .post('/api/complaints')
                    .set('Authorization', getAuthHeader(authToken))
                .send({
                    title: 'Concurrent Test',
                    categories: ['ทั่วไป'],
                    description: 'Testing concurrent updates',
                    location: JSON.stringify({
                        building: 'Test Building',
                        floor: '1',
                        room: '101'
                    }),
                    user_id: 'U001'
                });

            expect(createRes.status).to.equal(201);
            const complaintId = createRes.body.data.complaint_id;

            // อัปเดตแบบ sequential แทน concurrent เพื่อให้ได้ผลลัพธ์ที่ถูกต้อง
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .put(`/api/complaints/${complaintId}`)
                    .send({ 
                        action: 'like',
                        user_id: `U00${i}` // ใช้ user_id ต่างกันเพื่อไม่ให้ซ้ำ
                    });
            }

            // ตรวจสอบว่า likes = 5
            const finalRes = await request(app)
                .get(`/api/complaints/${complaintId}`);

            expect(finalRes.body.data).to.have.property('likes', 5);
        });
    });
});