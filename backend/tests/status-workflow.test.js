// backend/tests/status-workflow.test.js
// Tests สำหรับการตรวจสอบ Status Transition
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Complaint = require('../src/models/homeModel');

describe('🔄 ทดสอบ Status Workflow', () => {
    let complaintId;

    beforeEach(async () => {
        const complaint = await Complaint.create({
            complaint_id: 'C_STATUS_TEST',
            title: 'Test Status Workflow',
            categories: ['ทั่วไป'],
            description: 'Test',
            location: { building: 'A', floor: '1', room: '101' },
            current_status: 'รอรับเรื่อง',
            priority: 'low',
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

    describe('Status Transition Rules', () => {
        it('ควรอนุญาตให้เปลี่ยนจาก รอรับเรื่อง → กำลังดำเนินการ', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('current_status', 'กำลังดำเนินการ');
        });

        it('ควรอนุญาตให้เปลี่ยนจาก กำลังดำเนินการ → เสร็จสิ้น', async () => {
            // เปลี่ยนเป็น กำลังดำเนินการ ก่อน
            await Complaint.updateOne(
                { complaint_id: complaintId },
                { current_status: 'กำลังดำเนินการ' }
            );

            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'เสร็จสิ้น'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('current_status', 'เสร็จสิ้น');
            expect(res.body.data.completed_date).to.not.equal('-');
        });

        it('ไม่ควรอนุญาตให้เปลี่ยนจาก รอรับเรื่อง → เสร็จสิ้น', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'เสร็จสิ้น'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            expect(res.body).to.have.property('allowed_transitions');
        });

        it('ไม่ควรอนุญาตให้เปลี่ยนสถานะจาก เสร็จสิ้น', async () => {
            await Complaint.updateOne(
                { complaint_id: complaintId },
                { current_status: 'เสร็จสิ้น' }
            );

            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            expect(res.status).to.equal(400);
        });

        it('ควรอนุญาตให้ยกเลิกจากสถานะใดก็ได้ยกเว้น เสร็จสิ้น', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'ยกเลิก'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('current_status', 'ยกเลิก');
        });
    });
});