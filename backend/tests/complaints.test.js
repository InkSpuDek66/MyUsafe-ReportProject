// backend/tests/complaints.test.js
// ===============================================
// ทดสอบระบบเรื่องร้องเรียน (Complaints System Tests)
// ===============================================
// ไฟล์นี้ทดสอบ API ทั้งหมดของระบบเรื่องร้องเรียน:
// - POST /api/complaints (สร้างเรื่องร้องเรียนใหม่)
// - GET /api/complaints (ดึงข้อมูลเรื่องร้องเรียนทั้งหมด)
// - GET /api/complaints/:id (ดึงข้อมูลเรื่องร้องเรียนเฉพาะ)
// - PUT /api/complaints/:id (อัปเดตเรื่องร้องเรียน)
// - DELETE /api/complaints/:id (ลบเรื่องร้องเรียน)
// ===============================================

const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Complaint = require('../src/models/homeModel');
const { createAuthenticatedUser, getAuthHeader } = require('./testHelpers');

describe('📋 ทดสอบระบบเรื่องร้องเรียน', () => {
    // ตัวแปรเก็บข้อมูล authentication
    let authToken;
    let testUserId;

    // สร้างผู้ใช้ทดสอบและ login ก่อนเริ่มเทสต์ทั้งหมด
    before(async function() {
        this.timeout(10000);
        console.log('  📝 กำลังสร้างผู้ใช้ทดสอบสำหรับ Complaints Tests...');
        
        const authData = await createAuthenticatedUser();
        authToken = authData.token;
        testUserId = authData.userId;
        
        console.log('   สร้างผู้ใช้ทดสอบสำเร็จ');
    });

    // ==================================================
    // ทดสอบการสร้างเรื่องร้องเรียนใหม่ (POST)
    // ==================================================
    describe('POST /api/complaints - สร้างเรื่องร้องเรียนใหม่', () => {

        it(' ควรสร้างเรื่องร้องเรียนใหม่สำเร็จ', async () => {
            const complaintData = {
                title: 'แอร์ห้องเรียนเสีย',
                categories: ['ไฟฟ้า'],
                description: 'แอร์ห้อง 401 เปิดไม่ติด ร้อนมาก',
                location: JSON.stringify({
                    building: 'อาคาร 1',
                    floor: '4',
                    room: '401'
                }),
                user_id: testUserId
            };

            const res = await request(app)
                .post('/api/complaints')
                .set('Authorization', getAuthHeader(authToken))
                .send(complaintData);

            // ตรวจสอบว่าสร้างสำเร็จ (201 Created)
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('success', true);
            
            // ตรวจสอบข้อมูลที่ได้กลับมา
            expect(res.body.data).to.have.property('complaint_id');
            expect(res.body.data).to.have.property('title', complaintData.title);
            expect(res.body.data).to.have.property('current_status', 'รอรับเรื่อง');
            expect(res.body.data).to.have.property('views', 0);
            expect(res.body.data).to.have.property('likes', 0);
            expect(res.body.data).to.have.property('priority', 'low'); // default priority
        });

        it('ควรล้มเหลวเมื่อไม่มีหัวเรื่อง', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .set('Authorization', getAuthHeader(authToken))
                .send({
                    categories: ['ไฟฟ้า'],
                    description: 'ทดสอบ',
                    location: JSON.stringify({
                        building: 'อาคาร 1',
                        floor: '1'
                    })
                });

            // ควรได้ 400 Bad Request
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
        });

        it('ควรล้มเหลวเมื่อหมวดหมู่เป็น array ว่าง', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .set('Authorization', getAuthHeader(authToken))
                .send({
                    title: 'ทดสอบไม่มีหมวดหมู่',
                    categories: [],
                    description: 'ไม่มีหมวดหมู่',
                    location: JSON.stringify({
                        building: 'อาคาร 1',
                        floor: '1'
                    })
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
        });

        it('ควรล้มเหลวเมื่อไม่มีตำแหน่ง', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .set('Authorization', getAuthHeader(authToken))
                .send({
                    title: 'ทดสอบไม่มีตำแหน่ง',
                    categories: ['ทั่วไป'],
                    description: 'ไม่มีตำแหน่ง'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
        });

        it(' ควรสร้างเรื่องร้องเรียนที่มีหลายหมวดหมู่', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .set('Authorization', getAuthHeader(authToken))
                .send({
                    title: 'ทดสอบหลายหมวดหมู่',
                    categories: ['ไฟฟ้า', 'น้ำท่วม'],
                    description: 'มีปัญหาหลายอย่าง',
                    location: JSON.stringify({
                        building: 'อาคาร 1',
                        floor: '1',
                        room: '101'
                    }),
                    user_id: testUserId
                });

            expect(res.status).to.equal(201);
            expect(res.body.data.categories).to.be.an('array');
            expect(res.body.data.categories).to.have.lengthOf(2);
            expect(res.body.data.categories).to.include('ไฟฟ้า');
            expect(res.body.data.categories).to.include('น้ำท่วม');
        });
    });

    // ==================================================
    // ทดสอบการดึงข้อมูลเรื่องร้องเรียน (GET)
    // ==================================================
    describe('GET /api/complaints - ดึงข้อมูลเรื่องร้องเรียนทั้งหมด', () => {

        // สร้างข้อมูลทดสอบก่อนแต่ละ test
        beforeEach(async () => {
            await Complaint.create([
                {
                    complaint_id: 'C_TEST_001',
                    title: 'ไฟฟ้าขัดข้อง',
                    categories: ['ไฟฟ้า'],
                    description: 'ไฟดับ',
                    location: { building: 'อาคาร A', floor: '1', room: '101' },
                    current_status: 'รอรับเรื่อง',
                    priority: 'low',
                    status_history: [
                        { status_id: 'S001', status_name: 'รอรับเรื่อง', updated_at: new Date() }
                    ],
                    user_id: testUserId,
                    datetime_reported: new Date(),
                    likes: 0,
                    dislikes: 0,
                    views: 0
                },
                {
                    complaint_id: 'C_TEST_002',
                    title: 'น้ำท่วมห้องน้ำ',
                    categories: ['น้ำท่วม'],
                    description: 'น้ำท่วมชั้น 2',
                    location: { building: 'อาคาร B', floor: '2', room: '201' },
                    current_status: 'กำลังดำเนินการ',
                    priority: 'medium',
                    status_history: [
                        { status_id: 'S002', status_name: 'กำลังดำเนินการ', updated_at: new Date() }
                    ],
                    user_id: testUserId,
                    datetime_reported: new Date(),
                    likes: 5,
                    dislikes: 1,
                    views: 10
                }
            ]);
        });

        it(' ควรดึงเรื่องร้องเรียนทั้งหมดได้', async () => {
            const res = await request(app)
                .get('/api/complaints');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.be.at.least(2);
        });

        it(' ควรกรองเรื่องร้องเรียนตามสถานะได้', async () => {
            const res = await request(app)
                .get('/api/complaints?status=' + encodeURIComponent('รอรับเรื่อง'));

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            
            // ตรวจสอบว่าทุก item มีสถานะเป็น 'รอรับเรื่อง'
            res.body.data.forEach(complaint => {
                expect(complaint.current_status).to.equal('รอรับเรื่อง');
            });
        });

        it(' ควรกรองเรื่องร้องเรียนตามหมวดหมู่ได้', async () => {
            const res = await request(app)
                .get('/api/complaints?category=' + encodeURIComponent('ไฟฟ้า'));

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            
            // ตรวจสอบว่าทุก item มีหมวดหมู่ 'ไฟฟ้า'
            res.body.data.forEach(complaint => {
                expect(complaint.categories).to.include('ไฟฟ้า');
            });
        });
    });

    // ==================================================
    // ทดสอบการดึงข้อมูลเรื่องร้องเรียนเฉพาะ (GET by ID)
    // ==================================================
    describe('GET /api/complaints/:id - ดึงข้อมูลเรื่องร้องเรียนเฉพาะ', () => {
        let complaintId;

        beforeEach(async () => {
            const complaint = await Complaint.create({
                complaint_id: 'C_SPECIFIC',
                title: 'ทดสอบดึงข้อมูล',
                categories: ['ทั่วไป'],
                description: 'Test',
                location: { building: 'A', floor: '1', room: '101' },
                current_status: 'รอรับเรื่อง',
                priority: 'low',
                status_history: [
                    { status_id: 'S001', status_name: 'รอรับเรื่อง', updated_at: new Date() }
                ],
                user_id: testUserId,
                datetime_reported: new Date(),
                likes: 0,
                dislikes: 0,
                views: 0
            });
            complaintId = complaint.complaint_id;
        });

        it(' ควรดึงข้อมูลเรื่องร้องเรียนได้ตาม ID', async () => {
            const res = await request(app)
                .get(`/api/complaints/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('complaint_id', complaintId);
        });

        it('ควรคืนค่า 404 สำหรับ ID ที่ไม่มีอยู่', async () => {
            const res = await request(app)
                .get('/api/complaints/C_NOTEXIST');

            expect(res.status).to.equal(404);
        });
    });

    // ==================================================
    // ทดสอบการอัปเดตเรื่องร้องเรียน (PUT)
    // ==================================================
    describe('PUT /api/complaints/:id - อัปเดตเรื่องร้องเรียน', () => {
        let complaintId;

        beforeEach(async () => {
            const complaint = await Complaint.create({
                complaint_id: 'C_UPDATE',
                title: 'ทดสอบอัปเดต',
                categories: ['ทั่วไป'],
                description: 'Test',
                location: { building: 'A', floor: '1', room: '101' },
                current_status: 'รอรับเรื่อง',
                priority: 'low',
                status_history: [
                    { status_id: 'S001', status_name: 'รอรับเรื่อง', updated_at: new Date() }
                ],
                user_id: testUserId,
                datetime_reported: new Date(),
                likes: 0,
                dislikes: 0,
                views: 0
            });
            complaintId = complaint.complaint_id;
        });

        it(' ควรอัปเดตสถานะเรื่องร้องเรียนสำเร็จ', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('current_status', 'กำลังดำเนินการ');
        });

        it(' ควรเพิ่ม like ได้', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    action: 'like',
                    user_id: testUserId
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('likes', 1);
        });

        it('ควรคืนค่า 404 สำหรับ ID ที่ไม่มีอยู่', async () => {
            const res = await request(app)
                .put('/api/complaints/C_NOTEXIST')
                .send({
                    status: 'กำลังดำเนินการ'
                });

            expect(res.status).to.equal(404);
        });
    });

    // ==================================================
    // ทดสอบการลบเรื่องร้องเรียน (DELETE)
    // ==================================================
    describe('DELETE /api/complaints/:id - ลบเรื่องร้องเรียน', () => {
        let complaintId;

        beforeEach(async () => {
            const complaint = await Complaint.create({
                complaint_id: 'C_DELETE',
                title: 'ทดสอบลบ',
                categories: ['ทั่วไป'],
                description: 'Test',
                location: { building: 'A', floor: '1', room: '101' },
                current_status: 'รอรับเรื่อง',
                priority: 'low',
                status_history: [
                    { status_id: 'S001', status_name: 'รอรับเรื่อง', updated_at: new Date() }
                ],
                user_id: testUserId,
                datetime_reported: new Date(),
                likes: 0,
                dislikes: 0,
                views: 0
            });
            complaintId = complaint.complaint_id;
        });

        it(' ควรลบเรื่องร้องเรียนสำเร็จ', async () => {
            const res = await request(app)
                .delete(`/api/complaints/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);

            // ตรวจสอบว่าลบจริง
            const deleted = await Complaint.findOne({ complaint_id: complaintId });
            expect(deleted).to.be.null;
        });

        it('ควรคืนค่า 404 สำหรับเรื่องร้องเรียนที่ไม่มีอยู่', async () => {
            const res = await request(app)
                .delete('/api/complaints/C_NOTEXIST');

            expect(res.status).to.equal(404);
        });
    });

    // ==================================================
    // ทดสอบระดับความสำคัญ (Priority)
    // ==================================================
    describe('🔥 ทดสอบฟิลด์ระดับความสำคัญ', () => {

        it(' ควรสร้างเรื่องร้องเรียนด้วยระดับความสำคัญเริ่มต้นเป็น "low"', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .set('Authorization', getAuthHeader(authToken))
                .send({
                    title: 'Test Priority Default',
                    categories: ['ทั่วไป'],
                    description: 'Test default priority',
                    location: JSON.stringify({
                        building: 'อาคาร 1',
                        floor: '1',
                        room: '101'
                    }),
                    user_id: testUserId
                });

            expect(res.status).to.equal(201);
            expect(res.body.data).to.have.property('priority', 'low');
        });

        it(' ควรกรองเรื่องร้องเรียนตามระดับความสำคัญ', async () => {
            // สร้าง complaints หลาย priority
            await Complaint.create([
                {
                    complaint_id: 'C_LOW',
                    title: 'Low Priority',
                    categories: ['ทั่วไป'],
                    priority: 'low',
                    current_status: 'รอรับเรื่อง',
                    status_history: [
                        { status_id: 'S001', status_name: 'รอรับเรื่อง', updated_at: new Date() }
                    ],
                    user_id: testUserId,
                    location: { building: 'A', floor: '1', room: '101' },
                    datetime_reported: new Date(),
                    likes: 0,
                    dislikes: 0,
                    views: 0
                },
                {
                    complaint_id: 'C_URGENT',
                    title: 'Urgent Priority',
                    categories: ['น้ำท่วม'],
                    priority: 'urgent',
                    current_status: 'รอรับเรื่อง',
                    status_history: [
                        { status_id: 'S003', status_name: 'รอรับเรื่อง', updated_at: new Date() }
                    ],
                    user_id: testUserId,
                    location: { building: 'C', floor: '3', room: '301' },
                    datetime_reported: new Date(),
                    likes: 0,
                    dislikes: 0,
                    views: 0
                }
            ]);

            const res = await request(app)
                .get('/api/complaints?priority=urgent');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.be.at.least(1);
            
            // ตรวจสอบว่าทุก item มี priority เป็น urgent
            res.body.data.forEach(complaint => {
                expect(complaint.priority).to.equal('urgent');
            });
        });

        it(' ควรอัปเดตระดับความสำคัญของเรื่องร้องเรียน', async () => {
            // สร้าง complaint
            const createRes = await request(app)
                .post('/api/complaints')
                .set('Authorization', getAuthHeader(authToken))
                .send({
                    title: 'Test Priority Update',
                    categories: ['ทั่วไป'],
                    description: 'Test',
                    location: JSON.stringify({
                        building: 'อาคาร 1',
                        floor: '1',
                        room: '101'
                    }),
                    user_id: testUserId
                });

            const complaintId = createRes.body.data.complaint_id;

            // อัพเดท priority
            const updateRes = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    priority: 'high'
                });

            expect(updateRes.status).to.equal(200);
            expect(updateRes.body.data).to.have.property('priority', 'high');
        });
    });
});