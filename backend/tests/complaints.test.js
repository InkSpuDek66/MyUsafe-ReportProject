// backend/tests/complaints.test.js
// Tests สำหรับระบบเรื่องร้องเรียน
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Complaint = require('../src/models/homeModel');
const { createAuthenticatedUser, getAuthHeader } = require('./testHelpers');

describe(' ทดสอบระบบเรื่องร้องเรียน', () => {
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


    // ทดสอบการสร้างเรื่องร้องเรียนใหม่
    describe('POST /api/complaints - สร้างเรื่องร้องเรียนใหม่', () => {

        it('ควรสร้างเรื่องร้องเรียนใหม่สำเร็จ', async () => {
            const complaintData = {
                title: 'แอร์ห้องเรียนเสีย',
                categories: ['ไฟฟ้า'],
                description: 'แอร์ห้อง 401 เปิดไม่ติด ร้อนมาก',
                location: JSON.stringify({
                    building: 'อาคาร 1',
                    floor: '4',
                    room: '401'
                }),
                user_id: 'U0000001'
            };

            const res = await request(app)
                .post('/api/complaints')
                .set('Authorization', getAuthHeader(authToken))
                .send(complaintData);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('complaint_id');
            expect(res.body.data).to.have.property('title', complaintData.title);
            expect(res.body.data).to.have.property('current_status', 'รอรับเรื่อง');
            expect(res.body.data).to.have.property('views', 0);
            expect(res.body.data).to.have.property('likes', 0);
            expect(res.body.data).to.have.property('priority', 'low'); //  default priority
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

        it('ควรสร้างเรื่องร้องเรียนด้วยระดับความสำคัญเริ่มต้นเป็น "low"', async () => {
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
                    user_id: 'U001'
                });

            expect(res.status).to.equal(201);
            expect(res.body.data).to.have.property('priority', 'low');
        });

        it('ควรสร้างเรื่องร้องเรียนที่มีหลายหมวดหมู่', async () => {
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
                    user_id: 'U001'
                });

            expect(res.status).to.equal(201);
            expect(res.body.data.categories).to.be.an('array');
            expect(res.body.data.categories).to.have.lengthOf(2);
            expect(res.body.data.categories).to.include('ไฟฟ้า');
            expect(res.body.data.categories).to.include('น้ำท่วม');
        });
    });

    // ทดสอบการดึงข้อมูลเรื่องร้องเรียน
    describe('GET /api/complaints - ดึงข้อมูลเรื่องร้องเรียนทั้งหมด', () => {

        beforeEach(async () => {
            // สร้างข้อมูลทดสอบ
            await Complaint.create([
                {
                    complaint_id: 'C0000001',
                    title: 'Complaint 1',
                    categories: ['ไฟฟ้า'],
                    description: 'Test 1',
                    location: {
                        building: 'Building A',
                        floor: '1',
                        room: '101'
                    },
                    current_status: 'รอรับเรื่อง',
                    priority: 'low',
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
                    categories: ['น้ำท่วม'],
                    description: 'Test 2',
                    location: {
                        building: 'Building B',
                        floor: '2',
                        room: '201'
                    },
                    current_status: 'กำลังดำเนินการ',
                    priority: 'medium',
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
                    categories: ['ไฟฟ้า'],
                    description: 'Test 3',
                    location: {
                        building: 'Building C',
                        floor: '3',
                        room: '301'
                    },
                    current_status: 'เสร็จสิ้น',
                    priority: 'high',
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

        it('ควรดึงเรื่องร้องเรียนทั้งหมด', async () => {
            const res = await request(app)
                .get('/api/complaints');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(3);
        });

        it('ควรกรองเรื่องร้องเรียนตามสถานะ', async () => {
            const res = await request(app)
                .get(`/api/complaints?status=${encodeURIComponent('รอรับเรื่อง')}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(1);
            expect(res.body.data[0]).to.have.property('current_status', 'รอรับเรื่อง');
        });

        it('ควรกรองเรื่องร้องเรียนตามหมวดหมู่', async () => {
            const res = await request(app)
                .get(`/api/complaints?category=${encodeURIComponent('ไฟฟ้า')}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(2);
            res.body.data.forEach(complaint => {
                expect(complaint.categories).to.include('ไฟฟ้า');
            });
        });

        it('ควรค้นหาเรื่องร้องเรียนตามคำค้น', async () => {
            const res = await request(app)
                .get('/api/complaints?q=Complaint 2');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(1);
            expect(res.body.data[0]).to.have.property('title', 'Complaint 2');
        });

        it('ควรคืนเรื่องร้องเรียนทั้งหมดเมื่อสถานะเป็น "ทั้งหมด"', async () => {
            const res = await request(app)
                .get(`/api/complaints?status=${encodeURIComponent('ทั้งหมด')}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(3);
        });

        it('ควรกรองเรื่องร้องเรียนตามระดับความสำคัญ', async () => {
            const res = await request(app)
                .get('/api/complaints?priority=high');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.be.at.least(1);
            res.body.data.forEach(complaint => {
                expect(complaint).to.have.property('priority', 'high');
            });
        });

        it('ควรรองรับการแบ่งหน้า', async () => {
            const res = await request(app)
                .get('/api/complaints?page=1&limit=2');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.be.at.most(2);
            expect(res.body).to.have.property('pagination');
            expect(res.body.pagination).to.have.property('current_page', 1);
            expect(res.body.pagination).to.have.property('total_items', 3);
        });
    });

    // ทดสอบดูข้อมูลเรื่องร้องเรียนเดี่ยว
    describe('GET /api/complaints/:id - ดึงข้อมูลเรื่องร้องเรียนเดี่ยว', () => {
        let complaintId;

        beforeEach(async () => {
            const complaint = await Complaint.create({
                complaint_id: 'C1234567',
                title: 'Test Complaint',
                categories: ['ทั่วไป'],
                description: 'Test Description',
                location: {
                    building: 'Test Building',
                    floor: '1',
                    room: '101'
                },
                current_status: 'รอรับเรื่อง',
                priority: 'low',
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

        it('ควรดึงเรื่องร้องเรียนตาม ID', async () => {
            const res = await request(app)
                .get(`/api/complaints/${complaintId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('complaint_id', complaintId);
            expect(res.body.data).to.have.property('title', 'Test Complaint');
        });

        it('ควรคืนค่า 404 สำหรับเรื่องร้องเรียนที่ไม่มีอยู่', async () => {
            const res = await request(app)
                .get('/api/complaints/C9999999');

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error');
        });
    });

    // ทดสอบการอัปเดตเรื่องร้องเรียน
    describe('PUT /api/complaints/:id - อัปเดตเรื่องร้องเรียน', () => {
        let complaintId;

        beforeEach(async () => {
            const complaint = await Complaint.create({
                complaint_id: 'C1111111',
                title: 'Update Test',
                categories: ['ทั่วไป'],
                description: 'Test',
                location: {
                    building: 'Test Building',
                    floor: '1',
                    room: '101'
                },
                current_status: 'รอรับเรื่อง',
                priority: 'low',
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

        it('ควรอัปเดตสถานะเรื่องร้องเรียน', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('current_status', 'กำลังดำเนินการ');
            expect(res.body.data.status_history).to.have.lengthOf(2);
        });

        it('ควรอัปเดตสถานะเป็น เสร็จสิ้น และตั้งค่าวันที่เสร็จสิ้น', async () => {
            // Step 1: เปลี่ยนเป็น "กำลังดำเนินการ" ก่อน
            await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'กำลังดำเนินการ'
                });

            // Step 2: จึงค่อยเปลี่ยนเป็น "เสร็จสิ้น"
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    status: 'เสร็จสิ้น'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('current_status', 'เสร็จสิ้น');
            expect(res.body.data.completed_date).to.not.equal('-');
        });

        it('ควรเพิ่มจำนวนไลค์', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    action: 'like'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('likes', 1);
        });

        it('ควรเพิ่มจำนวนดิสไลค์', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    action: 'dislike'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('dislikes', 1);
        });

        it('ควรเพิ่มจำนวนการเข้าชม', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    action: 'view'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('views', 1);
        });

        it('ควรอัปเดตฟิลด์ที่กำหนดเองโดยใช้ set', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    set: {
                        title: 'Updated Title',
                        description: 'Updated Description'
                    }
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('title', 'Updated Title');
            expect(res.body.data).to.have.property('description', 'Updated Description');
        });

        it('ควรคืนค่า 404 สำหรับเรื่องร้องเรียนที่ไม่มีอยู่', async () => {
            const res = await request(app)
                .put('/api/complaints/C9999999')
                .send({
                    status: 'เสร็จสิ้น'
                });

            expect(res.status).to.equal(404);
        });

        it('ควรอัปเดตระดับความสำคัญของเรื่องร้องเรียน', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    priority: 'high'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('priority', 'high');
        });

        it('ควรปฏิเสธค่าระดับความสำคัญที่ไม่ถูกต้อง', async () => {
            const res = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    priority: 'invalid_priority'
                });

            // Priority ไม่เปลี่ยน (ยังเป็น 'low' ตาม default)
            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('priority', 'low');
        });
    });

    // ทดสอบการลบเรื่องร้องเรียน
    describe('DELETE /api/complaints/:id - ลบเรื่องร้องเรียน', () => {
        let complaintId;

        beforeEach(async () => {
            const complaint = await Complaint.create({
                complaint_id: 'C2222222',
                title: 'Delete Test',
                categories: ['ทั่วไป'],
                description: 'Test',
                location: {
                    building: 'Test Building',
                    floor: '1',
                    room: '101'
                },
                current_status: 'รอรับเรื่อง',
                priority: 'low',
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

        it('ควรลบเรื่องร้องเรียนสำเร็จ', async () => {
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
                .delete('/api/complaints/C9999999');

            expect(res.status).to.equal(404);
        });
    });

    // ทดสอบ Priority Field
    describe(' ทดสอบฟิลด์ระดับความสำคัญ', () => {

        it('ควรสร้างเรื่องร้องเรียนด้วยระดับความสำคัญเริ่มต้นเป็น "low"', async () => {
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
                    user_id: 'U001'
                });

            expect(res.status).to.equal(201);
            expect(res.body.data).to.have.property('priority', 'low');
        });

        it('ควรกรองเรื่องร้องเรียนตามระดับความสำคัญ', async () => {
            // สร้าง complaints หลาย priority
            await Complaint.create([
                {
                    complaint_id: 'C_LOW',
                    title: 'Low Priority',
                    categories: ['ทั่วไป'],
                    priority: 'low',
                    current_status: 'รอรับเรื่อง',
                    status_history: [{ status_id: 'S001', status_name: 'รอรับเรื่อง', updated_at: new Date() }],
                    user_id: 'U001',
                    location: { building: 'A', floor: '1', room: '101' },
                    datetime_reported: new Date(),
                    likes: 0,
                    dislikes: 0,
                    views: 0
                },
                {
                    complaint_id: 'C_HIGH',
                    title: 'High Priority',
                    categories: ['ไฟฟ้า'],
                    priority: 'high',
                    current_status: 'รอรับเรื่อง',
                    status_history: [{ status_id: 'S002', status_name: 'รอรับเรื่อง', updated_at: new Date() }],
                    user_id: 'U002',
                    location: { building: 'B', floor: '2', room: '201' },
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
                    status_history: [{ status_id: 'S003', status_name: 'รอรับเรื่อง', updated_at: new Date() }],
                    user_id: 'U003',
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
            expect(res.body.data).to.have.lengthOf(1);
            expect(res.body.data[0]).to.have.property('priority', 'urgent');
        });

        it('ควรอัปเดตระดับความสำคัญของเรื่องร้องเรียน', async () => {
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
                    user_id: 'U001'
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

        it('ควรตรวจสอบค่า enum ของระดับความสำคัญ', async () => {
            const createRes = await request(app)
                .post('/api/complaints')
                .set('Authorization', getAuthHeader(authToken))
                .send({
                    title: 'Test Invalid Priority',
                    categories: ['ทั่วไป'],
                    description: 'Test',
                    location: JSON.stringify({
                        building: 'อาคาร 1',
                        floor: '1',
                        room: '101'
                    }),
                    user_id: 'U001'
                });

            const complaintId = createRes.body.data.complaint_id;

            // ส่ง priority ที่ไม่ถูกต้อง
            const updateRes = await request(app)
                .put(`/api/complaints/${complaintId}`)
                .send({
                    priority: 'super_urgent' // invalid value
                });

            // Priority ไม่ควรเปลี่ยน
            expect(updateRes.status).to.equal(200);
            expect(updateRes.body.data).to.have.property('priority', 'low');
        });

        it('ควรจัดการระดับความสำคัญทุกระดับ', async () => {
            const priorities = ['low', 'medium', 'high', 'urgent'];

            for (const priority of priorities) {
                await Complaint.create({
                    complaint_id: `C_${priority.toUpperCase()}`,
                    title: `${priority} Priority Test`,
                    categories: ['ทั่วไป'],
                    priority: priority,
                    current_status: 'รอรับเรื่อง',
                    status_history: [{
                        status_id: `S_${priority}`,
                        status_name: 'รอรับเรื่อง',
                        updated_at: new Date()
                    }],
                    user_id: 'U001',
                    location: { building: 'A', floor: '1', room: '101' },
                    datetime_reported: new Date(),
                    likes: 0,
                    dislikes: 0,
                    views: 0
                });
            }

            const res = await request(app)
                .get('/api/complaints');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.be.at.least(4);

            // ตรวจสอบว่ามีทุก priority level
            const foundPriorities = res.body.data.map(c => c.priority);
            priorities.forEach(priority => {
                expect(foundPriorities).to.include(priority);
            });
        });
    });
});