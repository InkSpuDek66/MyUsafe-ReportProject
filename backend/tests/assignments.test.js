// backend/tests/assignments.test.js
// Tests สำหรับระบบการมอบหมายงาน
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Complaint = require('../src/models/homeModel');

describe('👤 ทดสอบระบบการมอบหมายงาน', () => {
    let complaintId;

    beforeEach(async () => {
        const complaint = await Complaint.create({
            complaint_id: 'C_ASSIGN_TEST',
            title: 'Test Complaint for Assignment',
            categories: ['ไฟฟ้า'],
            description: 'Test assignment',
            location: {
                building: 'อาคาร 1',
                floor: '2',
                room: '201'
            },
            current_status: 'รอรับเรื่อง',
            priority: 'medium',
            status_history: [{
                status_id: 'S001',
                status_name: 'รอรับเรื่อง',
                updated_at: new Date()
            }],
            user_id: 'U001',
            datetime_reported: new Date(),
            likes: 0,
            dislikes: 0,
            views: 0
        });
        complaintId = complaint.complaint_id;
    });

    describe('POST /api/assignments/:id/assign - มอบหมายงาน', () => {
        it('ควรมอบหมายงานสำเร็จ', async () => {
            const res = await request(app)
                .post(`/api/assignments/${complaintId}/assign`)
                .send({
                    assigned_to: 'STAFF001',
                    assigned_by: 'ADMIN001'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('assigned_to', 'STAFF001');
            expect(res.body.data).to.have.property('assigned_by', 'ADMIN001');
            expect(res.body.data).to.have.property('assigned_at');
        });

        it('ควรเปลี่ยนสถานะเป็น "กำลังดำเนินการ" หลังมอบหมาย', async () => {
            const res = await request(app)
                .post(`/api/assignments/${complaintId}/assign`)
                .send({
                    assigned_to: 'STAFF001'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('current_status', 'กำลังดำเนินการ');
            expect(res.body.data.status_history).to.have.lengthOf(2);
        });

        it('ควรล้มเหลวเมื่อไม่ระบุเจ้าหน้าที่', async () => {
            const res = await request(app)
                .post(`/api/assignments/${complaintId}/assign`)
                .send({});

            expect(res.status).to.equal(400);
        });

        it('ควรล้มเหลวเมื่อเรื่องร้องเรียนไม่มีอยู่', async () => {
            const res = await request(app)
                .post('/api/assignments/C_NOTEXIST/assign')
                .send({
                    assigned_to: 'STAFF001'
                });

            expect(res.status).to.equal(404);
        });
    });

    describe('GET /api/assignments/staff/:staffId - ดึงงานที่มอบหมาย', () => {
        beforeEach(async () => {
            // สร้างเรื่องร้องเรียนที่มอบหมายแล้ว
            await Complaint.create([
                {
                    complaint_id: 'C_ASSIGN_1',
                    title: 'Assigned 1',
                    categories: ['ไฟฟ้า'],
                    location: { building: 'A', floor: '1', room: '101' },
                    current_status: 'กำลังดำเนินการ',
                    priority: 'high',
                    status_history: [{ status_id: 'S001', status_name: 'กำลังดำเนินการ', updated_at: new Date() }],
                    user_id: 'U001',
                    assigned_to: 'STAFF001',
                    assigned_at: new Date(),
                    datetime_reported: new Date(),
                    likes: 0,
                    dislikes: 0,
                    views: 0
                },
                {
                    complaint_id: 'C_ASSIGN_2',
                    title: 'Assigned 2',
                    categories: ['น้ำท่วม'],
                    location: { building: 'B', floor: '2', room: '201' },
                    current_status: 'กำลังดำเนินการ',
                    priority: 'urgent',
                    status_history: [{ status_id: 'S002', status_name: 'กำลังดำเนินการ', updated_at: new Date() }],
                    user_id: 'U002',
                    assigned_to: 'STAFF001',
                    assigned_at: new Date(),
                    datetime_reported: new Date(),
                    likes: 0,
                    dislikes: 0,
                    views: 0
                }
            ]);
        });

        it('ควรดึงงานที่มอบหมายให้เจ้าหน้าที่ทั้งหมด', async () => {
            const res = await request(app)
                .get('/api/assignments/staff/STAFF001');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(2);
            expect(res.body).to.have.property('count', 2);
        });

        it('ควรคืนค่า array ว่างเมื่อไม่มีงาน', async () => {
            const res = await request(app)
                .get('/api/assignments/staff/STAFF999');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    describe('DELETE /api/assignments/:id/unassign - ยกเลิกการมอบหมาย', () => {
        beforeEach(async () => {
            await Complaint.updateOne(
                { complaint_id: complaintId },
                {
                    assigned_to: 'STAFF001',
                    assigned_at: new Date(),
                    assigned_by: 'ADMIN001'
                }
            );
        });

        it('ควรยกเลิกการมอบหมายสำเร็จ', async () => {
            const res = await request(app)
                .delete(`/api/assignments/${complaintId}/unassign`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('assigned_to', null);
            expect(res.body.data).to.have.property('assigned_at', null);
            expect(res.body.data).to.have.property('assigned_by', null);
        });
    });
});