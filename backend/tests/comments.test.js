// backend/tests/comments.test.js
// Tests for Comments API
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Comment = require('../src/models/commentModel');
const Complaint = require('../src/models/homeModel');

describe('ทดสอบ API Comments', () => {
    let complaintId;
    let testUserId = 'U001';

    beforeEach(async () => {
        // สร้าง complaint สำหรับทดสอบ
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
    });

    describe('POST /api/comments - สร้างความคิดเห็น', () => {
        it('ควรสร้างความคิดเห็นสำเร็จ', async () => {
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
    });

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

        it('ควรดึงความคิดเห็นทั้งหมดของเรื่องร้องเรียน', async () => {
            const res = await request(app)
                .get(`/api/comments/complaint/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(2);
        });

        it('ควร return array ว่างถ้าไม่มีความคิดเห็น', async () => {
            await Comment.deleteMany({ complaint_id: complaintId });

            const res = await request(app)
                .get(`/api/comments/complaint/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    describe('PUT /api/comments/:id - อัพเดทความคิดเห็น', () => {
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

        it('ควรอัพเดทความคิดเห็นสำเร็จ', async () => {
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
    });

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

        it('ควรลบความคิดเห็นสำเร็จ', async () => {
            const res = await request(app)
                .delete(`/api/comments/${commentId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
        });

        it('ควร return 404 ถ้าไม่พบความคิดเห็น', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .delete(`/api/comments/${fakeId}`);

            expect(res.status).to.equal(404);
        });
    });
});