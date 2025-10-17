// backend/tests/integration.test.js
// Test suite สำหรับการทดสอบแบบบูรณาการ (Integration Tests)
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Complaint = require('../src/models/homeModel');
const Location = require('../src/models/locationModel');
const Category = require('../src/models/categoryModel');

describe('🔗 Integration Tests', () => {

    describe('Complete Complaint Flow', () => {

        it('should complete full complaint lifecycle', async () => {
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
                .send({
                    title: 'Integration Test Complaint',
                    category: 'Integration Test',
                    description: 'Testing full flow',
                    location: 'อาคาร Integration ชั้น 1 ห้อง 101',
                    user_id: 'U_INT_001'
                });

            expect(complaintRes.status).to.equal(201);
            const complaintId = complaintRes.body.complaint_id;

            // 4. Get Complaint
            const getRes = await request(app)
                .get(`/api/complaints/${complaintId}`);

            expect(getRes.status).to.equal(200);
            expect(getRes.body).to.have.property('title', 'Integration Test Complaint');

            // 5. Update Status
            const updateRes = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            expect(updateRes.status).to.equal(200);
            expect(updateRes.body).to.have.property('current_status', 'กำลังดำเนินการ');

            // 6. Add Likes
            const likeRes = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    action: 'like'
                });

            expect(likeRes.status).to.equal(200);
            expect(likeRes.body).to.have.property('likes', 1);

            // 7. Complete Complaint
            const completeRes = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'เสร็จสิ้น'
                });

            expect(completeRes.status).to.equal(200);
            expect(completeRes.body).to.have.property('current_status', 'เสร็จสิ้น');
            expect(completeRes.body.completed_date).to.not.equal('-');

            // 8. Delete Complaint
            const deleteRes = await request(app)
                .delete(`/api/complaints/${complaintId}`);

            expect(deleteRes.status).to.equal(200);
        });
    });

    describe('Data Consistency Tests', () => {

        it('should maintain data consistency across operations', async () => {
            // สร้าง 5 complaints
            for (let i = 1; i <= 5; i++) {
                await request(app)
                    .post('/api/complaints')
                    .send({
                        title: `Complaint ${i}`,
                        category: 'ทั่วไป',
                        description: `Test ${i}`
                    });
            }

            // ตรวจสอบว่ามี 5 complaints
            const listRes = await request(app)
                .get('/api/complaints');

            expect(listRes.body).to.have.lengthOf(5);

            // อัปเดตทั้งหมดเป็น 'กำลังดำเนินการ'
            for (const complaint of listRes.body) {
                await request(app)
                    .put(`/api/complaints/${complaint.complaint_id}`)
                    .send({ status: 'กำลังดำเนินการ' });
            }

            // ตรวจสอบว่าทั้งหมดมี status ถูกต้อง
            const updatedRes = await request(app)
                .get(`/api/complaints?status=${encodeURIComponent('กำลังดำเนินการ')}`);

            expect(updatedRes.body).to.have.lengthOf(5);
            updatedRes.body.forEach(complaint => {
                expect(complaint).to.have.property('current_status', 'กำลังดำเนินการ');
                expect(complaint.status_history).to.have.lengthOf(2);
            });
        });
    });

    describe('Error Handling Tests', () => {

        it('should handle concurrent updates gracefully', async () => {
            // สร้าง complaint
            const createRes = await request(app)
                .post('/api/complaints')
                .send({
                    title: 'Concurrent Test',
                    category: 'ทั่วไป',
                    description: 'Testing concurrent updates'
                });

            const complaintId = createRes.body.complaint_id;

            // อัปเดตพร้อมกัน
            const updates = [];
            for (let i = 0; i < 5; i++) {
                updates.push(
                    request(app)
                        .put(`/api/complaints/${complaintId}`)
                        .send({ action: 'like' })
                );
            }

            await Promise.all(updates);

            // ตรวจสอบว่า likes = 5
            const finalRes = await request(app)
                .get(`/api/complaints/${complaintId}`);

            expect(finalRes.body).to.have.property('likes', 5);
        });
    });
});