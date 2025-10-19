// backend/tests/comments.test.js
// Tests สำหรับระบบความคิดเห็น
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Comment = require('../src/models/commentModel');
const Complaint = require('../src/models/homeModel');

describe('💬 ทดสอบระบบความคิดเห็น', () => {
    let complaintId;

    beforeEach(async () => {
        // สร้าง complaint ทดสอบ
        const complaint = await Complaint.create({
            complaint_id: 'C_COMMENT_TEST',
            title: 'Test Complaint for Comments',
            categories: ['ทั่วไป'],
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
            user_id: 'U001',
            datetime_reported: new Date(),
            likes: 0,
            dislikes: 0,
            views: 0
        });
        complaintId = complaint.complaint_id;
    });

    describe('POST /api/comments - เพิ่มความคิดเห็น', () => {
        it('ควรเพิ่มความคิดเห็นใหม่สำเร็จ', async () => {
            const commentData = {
                complaint_id: complaintId,
                user_id: 'U001',
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

        it('ควรล้มเหลวเมื่อไม่มีความคิดเห็น', async () => {
            const res = await request(app)
                .post('/api/comments')
                .send({
                    complaint_id: complaintId,
                    user_id: 'U001',
                    user_name: 'Test User'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
        });

        it('ควรล้มเหลวเมื่อเรื่องร้องเรียนไม่มีอยู่', async () => {
            const res = await request(app)
                .post('/api/comments')
                .send({
                    complaint_id: 'C_NOTEXIST',
                    user_id: 'U001',
                    user_name: 'Test User',
                    comment: 'Test comment'
                });

            expect(res.status).to.equal(404);
        });
    });

    describe('GET /api/comments/complaint/:complaintId - ดึงความคิดเห็น', () => {
        beforeEach(async () => {
            // สร้างความคิดเห็นทดสอบ
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
            expect(res.body).to.have.property('count', 2);
        });

        it('ควรเรียงความคิดเห็นจากเก่าไปใหม่', async () => {
            const res = await request(app)
                .get(`/api/comments/complaint/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body.data[0]).to.have.property('comment', 'Comment 1');
            expect(res.body.data[1]).to.have.property('comment', 'Comment 2');
        });

        it('ควรคืนค่า array ว่างเมื่อไม่มีความคิดเห็น', async () => {
            await Comment.deleteMany({});

            const res = await request(app)
                .get(`/api/comments/complaint/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    describe('PUT /api/comments/:id - แก้ไขความคิดเห็น', () => {
        let commentId;

        beforeEach(async () => {
            const comment = await Comment.create({
                complaint_id: complaintId,
                user_id: 'U001',
                user_name: 'Test User',
                comment: 'Original comment'
            });
            commentId = comment._id;
        });

        it('ควรแก้ไขความคิดเห็นสำเร็จ', async () => {
            const res = await request(app)
                .put(`/api/comments/${commentId}`)
                .send({
                    user_id: 'U001',
                    comment: 'Updated comment'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('comment', 'Updated comment');
            expect(res.body.data).to.have.property('is_edited', true);
        });

        it('ควรล้มเหลวเมื่อไม่ใช่เจ้าของความคิดเห็น', async () => {
            const res = await request(app)
                .put(`/api/comments/${commentId}`)
                .send({
                    user_id: 'U999', // คนอื่น
                    comment: 'Hacked comment'
                });

            expect(res.status).to.equal(403);
        });
    });

    describe('DELETE /api/comments/:id - ลบความคิดเห็น', () => {
        let commentId;

        beforeEach(async () => {
            const comment = await Comment.create({
                complaint_id: complaintId,
                user_id: 'U001',
                user_name: 'Test User',
                comment: 'To be deleted'
            });
            commentId = comment._id;
        });

        it('ควรลบความคิดเห็นสำเร็จ', async () => {
            const res = await request(app)
                .delete(`/api/comments/${commentId}`)
                .send({
                    user_id: 'U001'
                });

            expect(res.status).to.equal(200);

            const deleted = await Comment.findById(commentId);
            expect(deleted).to.be.null;
        });

        it('ควรล้มเหลวเมื่อไม่ใช่เจ้าของ', async () => {
            const res = await request(app)
                .delete(`/api/comments/${commentId}`)
                .send({
                    user_id: 'U999'
                });

            expect(res.status).to.equal(403);
        });
    });
});