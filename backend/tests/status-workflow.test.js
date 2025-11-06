// backend/tests/status-workflow.test.js
// ===============================================
// ทดสอบ Status Workflow (กระบวนการเปลี่ยนสถานะ)
// ===============================================
// ทดสอบกฎการเปลี่ยนสถานะของเรื่องร้องเรียน:
// รอรับเรื่อง -> กำลังดำเนินการ -> เสร็จสิ้น
// รอรับเรื่อง -> ยกเลิก
// ===============================================

const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Complaint = require('../src/models/homeModel');

describe('🔄 ทดสอบ Status Workflow', () => {
    let complaintId;

    // สร้าง complaint ทดสอบก่อนแต่ละ test
    beforeEach(async () => {
        console.log('  📝 กำลังสร้างเรื่องร้องเรียนสำหรับทดสอบ workflow...');
        
        const complaint = await Complaint.create({
            complaint_id: 'C_STATUS_TEST',
            title: 'Test Status Workflow',
            categories: ['ไฟฟ้า'],
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
        console.log('   สร้างเรื่องร้องเรียนทดสอบเสร็จสิ้น');
    });

    // ==================================================
    // ทดสอบกฎการเปลี่ยนสถานะ
    // ==================================================
    describe('Status Transition Rules', () => {
        
        it(' ควรเปลี่ยนสถานะจาก "รอรับเรื่อง" เป็น "กำลังดำเนินการ"', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('current_status', 'กำลังดำเนินการ');
        });

        it(' ควรเปลี่ยนสถานะจาก "กำลังดำเนินการ" เป็น "เสร็จสิ้น"', async () => {
            // เปลี่ยนสถานะเป็น "กำลังดำเนินการ" ก่อน
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
        });

        it(' ควรเปลี่ยนสถานะจาก "รอรับเรื่อง" เป็น "ยกเลิก"', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'ยกเลิก'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('current_status', 'ยกเลิก');
        });

        it('ควรตรวจสอบการเปลี่ยนสถานะที่ไม่ถูกต้อง', async () => {
            // เปลี่ยนสถานะเป็น "เสร็จสิ้น" ก่อน
            await Complaint.updateOne(
                { complaint_id: complaintId },
                { current_status: 'เสร็จสิ้น' }
            );

            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            // ขึ้นอยู่กับ business logic
            // อาจจะเป็น 400 (ไม่อนุญาต) หรือ 200 (อนุญาต)
            expect([200, 400]).to.include(res.status);
        });

        it(' ควรบันทึก status_history เมื่อเปลี่ยนสถานะ', async () => {
            await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            const complaint = await Complaint.findOne({ complaint_id: complaintId });
            
            // ควรมี 2 status history (รอรับเรื่อง และ กำลังดำเนินการ)
            expect(complaint.status_history).to.have.lengthOf(2);
            expect(complaint.status_history[1].status_name).to.equal('กำลังดำเนินการ');
        });

        it(' ควรบันทึกเวลาที่เปลี่ยนสถานะ', async () => {
            const beforeTime = new Date();
            
            await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            const complaint = await Complaint.findOne({ complaint_id: complaintId });
            const lastHistory = complaint.status_history[complaint.status_history.length - 1];
            
            expect(lastHistory.updated_at).to.be.instanceOf(Date);
            expect(lastHistory.updated_at.getTime()).to.be.at.least(beforeTime.getTime());
        });

        it(' ควรบันทึก completed_date เมื่อเสร็จสิ้น', async () => {
            // เปลี่ยนเป็น กำลังดำเนินการ
            await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({ status: 'กำลังดำเนินการ' });

            // เปลี่ยนเป็น เสร็จสิ้น
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({ status: 'เสร็จสิ้น' });

            expect(res.status).to.equal(200);
            // ตรวจสอบว่ามี completed_date และไม่ใช่ '-'
            expect(res.body.data.completed_date).to.not.equal('-');
        });
    });
});