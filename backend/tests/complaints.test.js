// backend/tests/complaints.test.js
// Tests สำหรับระบบเรื่องร้องเรียน
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Complaint = require('../src/models/homeModel');

describe('📝 Complaint System Tests', () => {

    // ทดสอบการสร้างเรื่องร้องเรียนใหม่
    describe('POST /api/complaints - Create Complaint', () => {
        it('should create a new complaint successfully', async () => {
            const complaintData = {
                title: 'แอร์ห้องเรียนเสีย',
                category: 'ไฟฟ้า',
                description: 'แอร์ห้อง 401 เปิดไม่ติด ร้อนมาก',
                location: 'อาคาร 1 ชั้น 4 ห้อง 401',
                user_id: 'U0000001'
            };

            const res = await request(app)
                .post('/api/complaints')
                .send(complaintData);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('complaint_id');
            expect(res.body).to.have.property('title', complaintData.title);
            expect(res.body).to.have.property('category', complaintData.category);
            expect(res.body).to.have.property('current_status', 'รอรับเรื่อง');
            expect(res.body).to.have.property('views', 0);
            expect(res.body).to.have.property('likes', 0);
        });

        it('should fail when title is missing', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .send({
                    category: 'ไฟฟ้า',
                    description: 'ทดสอบ'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
        });

        it('should create complaint with default category', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .send({
                    title: 'ทดสอบหมวดหมู่เริ่มต้น',
                    description: 'ไม่ได้ระบุหมวดหมู่'
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('category', 'ทั่วไป');
        });

        it('should create complaint with attachments array', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .send({
                    title: 'ทดสอบอัปโหลดรูป',
                    description: 'มีรูปภาพแนบ',
                    attachments: ['/uploads/img1.jpg', '/uploads/img2.jpg']
                });

            expect(res.status).to.equal(201);
            expect(res.body.attachments).to.be.an('array');
            expect(res.body.attachments).to.have.lengthOf(2);
        });

        it('should create complaint with single attachment string', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .send({
                    title: 'ทดสอบรูปเดียว',
                    description: 'มีรูปภาพ 1 รูป',
                    attachments: '/uploads/img1.jpg'
                });

            expect(res.status).to.equal(201);
            expect(res.body.attachments).to.be.an('array');
            expect(res.body.attachments).to.have.lengthOf(1);
        });
    });

    // ทดสอบการดึงข้อมูลเรื่องร้องเรียน
    describe('GET /api/complaints - Get All Complaints', () => {

        beforeEach(async () => {
            // สร้างข้อมูลทดสอบ
            await Complaint.create([
                {
                    complaint_id: 'C0000001',
                    title: 'Complaint 1',
                    category: 'ไฟฟ้า',
                    description: 'Test 1',
                    location: 'Building A',
                    current_status: 'รอรับเรื่อง',
                    status_history: [
                        { status_id: 'S0001', status_name: 'รอรับเรื่อง', updated_at: new Date() }
                    ],
                    user_id: 'U0001',
                    datetime_reported: new Date(),
                    likes: 0,
                    dislikes: 0,
                    views: 0
                },
                {
                    complaint_id: 'C0000002',
                    title: 'Complaint 2',
                    category: 'น้ำท่วม',
                    description: 'Test 2',
                    location: 'Building B',
                    current_status: 'กำลังดำเนินการ',
                    status_history: [
                        { status_id: 'S0002', status_name: 'กำลังดำเนินการ', updated_at: new Date() }
                    ],
                    user_id: 'U0002',
                    datetime_reported: new Date(),
                    likes: 5,
                    dislikes: 1,
                    views: 10
                },
                {
                    complaint_id: 'C0000003',
                    title: 'Complaint 3',
                    category: 'ไฟฟ้า',
                    description: 'Test 3',
                    location: 'Building C',
                    current_status: 'เสร็จสิ้น',
                    status_history: [
                        { status_id: 'S0003', status_name: 'เสร็จสิ้น', updated_at: new Date() }
                    ],
                    user_id: 'U0003',
                    datetime_reported: new Date(),
                    likes: 10,
                    dislikes: 0,
                    views: 20
                }
            ]);
        });

        it('should get all complaints', async () => {
            const res = await request(app)
                .get('/api/complaints');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf(3);
        });

        it('should filter complaints by status', async () => {
            const res = await request(app)
                .get(`/api/complaints?status=${encodeURIComponent('รอรับเรื่อง')}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0]).to.have.property('current_status', 'รอรับเรื่อง');
        });

        it('should filter complaints by category', async () => {
            const res = await request(app)
                .get(`/api/complaints?category=${encodeURIComponent('ไฟฟ้า')}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf(2);
            res.body.forEach(complaint => {
                expect(complaint).to.have.property('category', 'ไฟฟ้า');
            });
        });

        it('should search complaints by keyword', async () => {
            const res = await request(app)
                .get('/api/complaints?q=Complaint 2');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0]).to.have.property('title', 'Complaint 2');
        });

        it('should return all complaints when status is "ทั้งหมด"', async () => {
            const res = await request(app)
                .get('/api/complaints?status=ทั้งหมด');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.lengthOf(3);
        });
    });

    // ทดสอบดูข้อมูลเรื่องร้องเรียนเดี่ยว
    describe('GET /api/complaints/:id - Get Single Complaint', () => {
        let complaintId;
        beforeEach(async () => {
            const complaint = await Complaint.create({
                complaint_id: 'C1234567',
                title: 'Test Complaint',
                category: 'ทั่วไป',
                description: 'Test Description',
                location: 'Test Location',
                current_status: 'รอรับเรื่อง',
                status_history: [
                    { status_id: 'S0001', status_name: 'รอรับเรื่อง', updated_at: new Date() }
                ],
                user_id: 'U0001',
                datetime_reported: new Date(),
                likes: 0,
                dislikes: 0,
                views: 0
            });
            complaintId = complaint.complaint_id;
        });

        it('should get complaint by ID', async () => {
            const res = await request(app)
                .get(`/api/complaints/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('complaint_id', complaintId);
            expect(res.body).to.have.property('title', 'Test Complaint');
        });

        it('should return 404 for non-existent complaint', async () => {
            const res = await request(app)
                .get('/api/complaints/C9999999');

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error');
        });
    });

    // ทดสอบการอัปเดตเรื่องร้องเรียน
    describe('PUT /api/complaints/:id - Update Complaint', () => {
        let complaintId;
        beforeEach(async () => {
            const complaint = await Complaint.create({
                complaint_id: 'C1111111',
                title: 'Update Test',
                category: 'ทั่วไป',
                description: 'Test',
                location: 'Test',
                current_status: 'รอรับเรื่อง',
                status_history: [
                    { status_id: 'S0001', status_name: 'รอรับเรื่อง', updated_at: new Date() }
                ],
                user_id: 'U0001',
                datetime_reported: new Date(),
                likes: 0,
                dislikes: 0,
                views: 0
            });
            complaintId = complaint.complaint_id;
        });

        it('should update complaint status', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('current_status', 'กำลังดำเนินการ');
            expect(res.body.status_history).to.have.lengthOf(2);
        });

        it('should update status to เสร็จสิ้น and set completed_date', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'เสร็จสิ้น'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('current_status', 'เสร็จสิ้น');
            expect(res.body.completed_date).to.not.equal('-');
        });

        it('should increment likes', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    action: 'like'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('likes', 1);
        });

        it('should increment dislikes', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    action: 'dislike'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('dislikes', 1);
        });

        it('should increment views', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    action: 'view'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('views', 1);
        });

        it('should update custom fields using set', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    set: {
                        title: 'Updated Title',
                        description: 'Updated Description'
                    }
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('title', 'Updated Title');
            expect(res.body).to.have.property('description', 'Updated Description');
        });

        it('should return 404 for non-existent complaint', async () => {
            const res = await request(app)
                .put('/api/complaints/C9999999')
                .send({
                    status: 'เสร็จสิ้น'
                });

            expect(res.status).to.equal(404);
        });
    });

    // ทดสอบการลบเรื่องร้องเรียน
    describe('DELETE /api/complaints/:id - Delete Complaint', () => {
        let complaintId;
        beforeEach(async () => {
            const complaint = await Complaint.create({
                complaint_id: 'C2222222',
                title: 'Delete Test',
                category: 'ทั่วไป',
                description: 'Test',
                location: 'Test',
                current_status: 'รอรับเรื่อง',
                status_history: [
                    { status_id: 'S0001', status_name: 'รอรับเรื่อง', updated_at: new Date() }
                ],
                user_id: 'U0001',
                datetime_reported: new Date(),
                likes: 0,
                dislikes: 0,
                views: 0
            });
            complaintId = complaint.complaint_id;
        });

        it('should delete complaint successfully', async () => {
            const res = await request(app)
                .delete(`/api/complaints/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);

            // ตรวจสอบว่าลบจริง
            const deleted = await Complaint.findOne({ complaint_id: complaintId });
            expect(deleted).to.be.null;
        });

        it('should return 404 for non-existent complaint', async () => {
            const res = await request(app)
                .delete('/api/complaints/C9999999');

            expect(res.status).to.equal(404);
        });
    });
});