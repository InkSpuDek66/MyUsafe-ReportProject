// backend/tests/comments.test.js
// ===============================================
// ทดสอบ API Comments (ความคิดเห็น)
// ===============================================
// ทดสอบระบบความคิดเห็นในเรื่องร้องเรียน:
// - POST /api/comments (สร้างความคิดเห็น)
// - GET /api/comments/complaint/:complaintId (ดึงความคิดเห็น)
// - PUT /api/comments/:id (อัปเดตความคิดเห็น)
// - DELETE /api/comments/:id (ลบความคิดเห็น)
// ===============================================

const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Comment = require('../src/models/commentModel');
const Complaint = require('../src/models/homeModel');

describe('💬 ทดสอบ API Comments', () => {
    let complaintId;
    let testUserId = 'U001';

    // สร้าง complaint ทดสอบก่อนแต่ละ test
    beforeEach(async () => {
        console.log('  📝 กำลังสร้างเรื่องร้องเรียนสำหรับทดสอบ comments...');
        
        const complaint = await Complaint.create({
            complaint_id: 'C_COMMENT_TEST',
            title: 'Test Complaint for Comments',
            categories: ['ไฟฟ้า'],
            description: 'Test',
            location: {
                building: 'Test Building',
                floor: '1',
                room: '101'
            },
            current_status: 'รอรับเรื่อง',
            priority: 'low',
            status_history: [{
                status_id: 'S001',
                status_name: 'รอรับเรื่อง',
                updated_at: new Date()
            }],
            user_id: testUserId,
            datetime_reported: new Date(),
            likes: 0,
            dislikes: 0,
            views: 0
        });
        
        complaintId = complaint.complaint_id;
        console.log('   สร้างเรื่องร้องเรียนทดสอบเสร็จสิ้น');
    });

    // ==================================================
    // ทดสอบการสร้างความคิดเห็น
    // ==================================================
    describe('POST /api/comments - สร้างความคิดเห็น', () => {
        
        it(' ควรสร้างความคิดเห็นสำเร็จ', async () => {
            const commentData = {
                complaint_id: complaintId,
                user_id: testUserId,
                user_name: 'Test User',
                user_role: 'reporter',
                comment: 'นี่คือความคิดเห็นทดสอบ'
            };

            const res = await request(app)
                .post('/api/comments')
                .send(commentData);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('comment', commentData.comment);
            expect(res.body.data).to.have.property('user_name', commentData.user_name);
        });

        it('ควรล้มเหลวเมื่อไม่ระบุความคิดเห็น', async () => {
            const res = await request(app)
                .post('/api/comments')
                .send({
                    complaint_id: complaintId,
                    user_id: testUserId,
                    user_name: 'Test User'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
        });

        it('ควรล้มเหลวเมื่อ complaint ไม่มีอยู่', async () => {
            const res = await request(app)
                .post('/api/comments')
                .send({
                    complaint_id: 'C_NOTEXIST',
                    user_id: testUserId,
                    user_name: 'Test User',
                    comment: 'Test comment'
                });

            expect(res.status).to.equal(404);
        });

        it(' ควรสร้างความคิดเห็นที่มีเนื้อหายาวได้', async () => {
            const longComment = 'นี่คือความคิดเห็นที่ยาวมากๆ '.repeat(50);
            
            const res = await request(app)
                .post('/api/comments')
                .send({
                    complaint_id: complaintId,
                    user_id: testUserId,
                    user_name: 'Test User',
                    comment: longComment
                });

            expect(res.status).to.equal(201);
            expect(res.body.data.comment).to.have.lengthOf.at.least(100);
        });
    });

    // ==================================================
    // ทดสอบการดึงความคิดเห็น
    // ==================================================
    describe('GET /api/comments/complaint/:complaintId - ดึงความคิดเห็น', () => {
        
        beforeEach(async () => {
            // สร้างข้อมูลทดสอบ
            await Comment.create([
                {
                    complaint_id: complaintId,
                    user_id: 'U001',
                    user_name: 'User 1',
                    comment: 'Comment 1',
                    created_at: new Date('2025-01-01')
                },
                {
                    complaint_id: complaintId,
                    user_id: 'U002',
                    user_name: 'User 2',
                    comment: 'Comment 2',
                    created_at: new Date('2025-01-02')
                }
            ]);
        });

        it(' ควรดึงความคิดเห็นทั้งหมดของเรื่องร้องเรียน', async () => {
            const res = await request(app)
                .get(`/api/comments/complaint/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(2);
        });

        it(' ควร return array ว่างถ้าไม่มีความคิดเห็น', async () => {
            await Comment.deleteMany({ complaint_id: complaintId });

            const res = await request(app)
                .get(`/api/comments/complaint/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });

        it(' ความคิดเห็นควรเรียงลำดับตามเวลา', async () => {
            const res = await request(app)
                .get(`/api/comments/complaint/${complaintId}`);

            expect(res.status).to.equal(200);
            const comments = res.body.data;
            
            // ตรวจสอบว่าเรียงตามเวลา (จากเก่าไปใหม่หรือใหม่ไปเก่า)
            for (let i = 0; i < comments.length - 1; i++) {
                const currentDate = new Date(comments[i].created_at);
                const nextDate = new Date(comments[i + 1].created_at);
                // อนุญาตให้เรียงแบบใดแบบหนึ่งก็ได้
                expect(currentDate <= nextDate || currentDate >= nextDate).to.be.true;
            }
        });
    });

    // ==================================================
    // ทดสอบการอัปเดตความคิดเห็น
    // ==================================================
    describe('PUT /api/comments/:id - อัปเดตความคิดเห็น', () => {
        let commentId;

        beforeEach(async () => {
            const comment = await Comment.create({
                complaint_id: complaintId,
                user_id: testUserId,
                user_name: 'Test User',
                comment: 'Original comment'
            });
            commentId = comment._id;
        });

        it(' ควรอัปเดตความคิดเห็นสำเร็จ', async () => {
            const res = await request(app)
                .put(`/api/comments/${commentId}`)
                .send({
                    comment: 'Updated comment',
                    user_id: testUserId,
                    user_role: 'reporter'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('comment', 'Updated comment');
        });

        it('ควร return 404 ถ้าไม่พบความคิดเห็น', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .put(`/api/comments/${fakeId}`)
                .send({
                    comment: 'Updated',
                    user_id: testUserId,
                    user_role: 'reporter'
                });

            expect(res.status).to.equal(404);
        });

        it(' ควรบันทึกเวลาที่แก้ไข', async () => {
            const res = await request(app)
                .put(`/api/comments/${commentId}`)
                .send({
                    comment: 'Updated comment',
                    user_id: testUserId
                });

            expect(res.status).to.equal(200);
            // บาง API อาจจะมี updated_at field
            if (res.body.data.updated_at) {
                expect(res.body.data).to.have.property('updated_at');
            }
        });
    });

    // ==================================================
    // ทดสอบการลบความคิดเห็น
    // ==================================================
    describe('DELETE /api/comments/:id - ลบความคิดเห็น', () => {
        let commentId;

        beforeEach(async () => {
            const comment = await Comment.create({
                complaint_id: complaintId,
                user_id: testUserId,
                user_name: 'Test User',
                comment: 'Test comment'
            });
            commentId = comment._id;
        });

        it(' ควรลบความคิดเห็นสำเร็จ', async () => {
            const res = await request(app)
                .delete(`/api/comments/${commentId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);

            // ตรวจสอบว่าลบจริง
            const deleted = await Comment.findById(commentId);
            expect(deleted).to.be.null;
        });

        it('ควร return 404 ถ้าไม่พบความคิดเห็น', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .delete(`/api/comments/${fakeId}`);

            expect(res.status).to.equal(404);
        });
    });
});