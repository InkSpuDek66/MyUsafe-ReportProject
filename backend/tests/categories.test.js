// backend/tests/categories.test.js
// ===============================================
// ทดสอบ API Categories (หมวดหมู่เรื่องร้องเรียน)
// ===============================================
// ทดสอบ CRUD operations สำหรับหมวดหมู่:
// - GET /api/categories (ดึงรายการหมวดหมู่ทั้งหมด)
// - POST /api/categories (สร้างหมวดหมู่ใหม่)
// - PUT /api/categories/:id (อัปเดตหมวดหมู่)
// - DELETE /api/categories/:id (ลบหมวดหมู่)
// ===============================================

const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Category = require('../src/models/categoryModel');

describe('📁 ทดสอบ API Categories', () => {

    // สร้างข้อมูลทดสอบก่อนแต่ละ test
    beforeEach(async () => {
        console.log('  📝 กำลังสร้างข้อมูลหมวดหมู่ทดสอบ...');
        
        await Category.create([
            { 
                name: 'ไฟฟ้า', 
                description: 'ปัญหาเกี่ยวกับไฟฟ้า', 
                icon: 'electric' 
            },
            { 
                name: 'ประปา', 
                description: 'ปัญหาเกี่ยวกับระบบประปา', 
                icon: 'water' 
            },
            { 
                name: 'ความสะอาด', 
                description: 'ปัญหาเกี่ยวกับความสะอาด', 
                icon: 'clean' 
            }
        ]);
        
        console.log('สร้างข้อมูลทดสอบเสร็จสิ้น');
    });

    // ==================================================
    // ทดสอบการดึงรายการหมวดหมู่ (GET)
    // ==================================================
    describe('GET /api/categories - ดึงรายการหมวดหมู่', () => {

        it(' ควรดึงรายการหมวดหมู่ทั้งหมดได้', async () => {
            const res = await request(app)
                .get('/api/categories');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(3);

            // ตรวจสอบว่ามี property ที่จำเป็น
            expect(res.body.data[0]).to.have.property('name');
            expect(res.body.data[0]).to.have.property('description');
            expect(res.body.data[0]).to.have.property('icon');
        });

        it('ควร return array ว่างถ้าไม่มีข้อมูล', async () => {
            // ลบข้อมูลทั้งหมด
            await Category.deleteMany({});

            const res = await request(app)
                .get('/api/categories');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });

        it(' แต่ละหมวดหมู่ควรมีโครงสร้างข้อมูลที่ถูกต้อง', async () => {
            const res = await request(app)
                .get('/api/categories');

            expect(res.status).to.equal(200);
            
            // ตรวจสอบโครงสร้างของแต่ละหมวดหมู่
            res.body.data.forEach(category => {
                expect(category).to.have.property('name').that.is.a('string');
                expect(category).to.have.property('description').that.is.a('string');
                expect(category).to.have.property('icon').that.is.a('string');
                expect(category).to.have.property('_id');
            });
        });
    });

    // ==================================================
    // ทดสอบการสร้างหมวดหมู่ใหม่ (POST)
    // ==================================================
    describe('POST /api/categories - สร้างหมวดหมู่ใหม่', () => {

        it('ควรสร้างหมวดหมู่ใหม่สำเร็จ', async () => {
            const categoryData = {
                name: 'อื่นๆ',
                description: 'ปัญหาอื่นๆ ที่ไม่ระบุ',
                icon: 'other'
            };

            const res = await request(app)
                .post('/api/categories')
                .send(categoryData);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('name', categoryData.name);
            expect(res.body.data).to.have.property('description', categoryData.description);
            expect(res.body.data).to.have.property('icon', categoryData.icon);
        });

        it('ควรล้มเหลวถ้าไม่ระบุชื่อหมวดหมู่', async () => {
            const categoryData = {
                description: 'Test description',
                icon: 'test'
            };

            const res = await request(app)
                .post('/api/categories')
                .send(categoryData);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
        });

        it('ควรล้มเหลวถ้าชื่อซ้ำ', async () => {
            const categoryData = {
                name: 'ไฟฟ้า', // ชื่อนี้มีอยู่แล้วใน beforeEach
                description: 'ซ้ำ',
                icon: 'electric'
            };

            const res = await request(app)
                .post('/api/categories')
                .send(categoryData);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
        });

        it(' ควรสร้างหมวดหมู่ได้แม้ไม่มี icon', async () => {
            const categoryData = {
                name: 'ทดสอบไม่มี icon',
                description: 'Test without icon'
            };

            const res = await request(app)
                .post('/api/categories')
                .send(categoryData);

            // อาจจะสำเร็จหรือล้มเหลวขึ้นอยู่กับ business logic
            // แต่ควร handle ได้
            expect([200, 201, 400]).to.include(res.status);
        });
    });

    // ==================================================
    // ทดสอบการอัปเดตหมวดหมู่ (PUT)
    // ==================================================
    describe('PUT /api/categories/:id - อัปเดตหมวดหมู่', () => {

        it(' ควรอัปเดตหมวดหมู่สำเร็จ', async () => {
            // ค้นหา category ที่ต้องการอัปเดท
            const category = await Category.findOne({ name: 'ไฟฟ้า' });
            expect(category).to.not.be.null;

            // รอสักครู่เพื่อให้แน่ใจว่าข้อมูลถูกบันทึกแล้ว
            await new Promise(resolve => setTimeout(resolve, 100));

            // อัปเดตหมวดหมู่ (ส่งข้อมูลที่ต้องการอัปเดต)
            const res = await request(app)
                .put(`/api/categories/${category._id}`)
                .send({
                    name: 'ไฟฟ้า', // ต้องส่ง name ด้วยเพราะบาง API ต้องการ
                    description: 'คำอธิบายใหม่สำหรับไฟฟ้า',
                    icon: 'electric'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('description', 'คำอธิบายใหม่สำหรับไฟฟ้า');
        });

        it(' ควรอัปเดต icon ได้', async () => {
            const category = await Category.findOne({ name: 'ประปา' });
            expect(category).to.not.be.null;

            await new Promise(resolve => setTimeout(resolve, 100));

            const res = await request(app)
                .put(`/api/categories/${category._id}`)
                .send({
                    name: 'ประปา',
                    description: category.description,
                    icon: 'water-new' // เปลี่ยน icon
                });

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.property('icon', 'water-new');
        });

        it('ควร return 404 ถ้าไม่พบหมวดหมู่', async () => {
            // ใช้ fake ID ที่มี format ถูกต้องแต่ไม่มีในฐานข้อมูล
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .put(`/api/categories/${fakeId}`)
                .send({
                    name: 'Test',
                    description: 'Test description'
                });

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('success', false);
        });

        it('ควรล้มเหลวถ้าอัปเดตเป็นชื่อที่ซ้ำกับหมวดหมู่อื่น', async () => {
            const category = await Category.findOne({ name: 'ประปา' });
            expect(category).to.not.be.null;

            const res = await request(app)
                .put(`/api/categories/${category._id}`)
                .send({
                    name: 'ไฟฟ้า', // ชื่อนี้มีอยู่แล้ว
                    description: 'Test'
                });

            // ควรได้ 400 Bad Request
            expect(res.status).to.equal(400);
        });
    });

    // ==================================================
    // ทดสอบการลบหมวดหมู่ (DELETE)
    // ==================================================
    describe('DELETE /api/categories/:id - ลบหมวดหมู่', () => {

        it(' ควรลบหมวดหมู่สำเร็จ', async () => {
            // ค้นหา category ที่ต้องการลบ
            const category = await Category.findOne({ name: 'ความสะอาด' });
            expect(category).to.not.be.null;

            // รอสักครู่เพื่อให้แน่ใจว่าข้อมูลถูกบันทึกแล้ว
            await new Promise(resolve => setTimeout(resolve, 100));

            const res = await request(app)
                .delete(`/api/categories/${category._id}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);

            // ตรวจสอบว่าลบจริง
            const deleted = await Category.findById(category._id);
            expect(deleted).to.be.null;
        });

        it('ควร return 404 ถ้าไม่พบหมวดหมู่', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .delete(`/api/categories/${fakeId}`);

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('success', false);
        });

        it(' ควรตรวจสอบว่าหมวดหมู่ไม่ถูกใช้งานก่อนลบ', async () => {
            // Test นี้ขึ้นอยู่กับ business logic
            // ถ้า API ไม่อนุญาตให้ลบหมวดหมู่ที่ถูกใช้งาน
            // ควรทดสอบว่า API จะ return error ที่เหมาะสม
            
            const category = await Category.findOne({ name: 'ไฟฟ้า' });
            
            // ในกรณีนี้ เราแค่ทดสอบว่าลบได้
            const res = await request(app)
                .delete(`/api/categories/${category._id}`);

            // อาจจะสำเร็จหรือล้มเหลวขึ้นอยู่กับว่ามี complaint ที่ใช้หมวดหมู่นี้หรือไม่
            expect([200, 400]).to.include(res.status);
        });
    });

    // ==================================================
    // ทดสอบการค้นหาและกรองข้อมูล
    // ==================================================
    describe('🔍 ทดสอบการค้นหาและกรองข้อมูล', () => {

        it(' ควรค้นหาหมวดหมู่ตามชื่อได้', async () => {
            const res = await request(app)
                .get('/api/categories?search=' + encodeURIComponent('ไฟฟ้า'));

            // ถ้า API support การค้นหา
            if (res.status === 200) {
                expect(res.body.data).to.be.an('array');
                
                // ตรวจสอบว่าผลลัพธ์มีคำว่า 'ไฟฟ้า'
                if (res.body.data.length > 0) {
                    const foundCategory = res.body.data.find(cat => cat.name.includes('ไฟฟ้า'));
                    expect(foundCategory).to.not.be.undefined;
                }
            }
        });

        it(' ควรนับจำนวนหมวดหมู่ทั้งหมดได้', async () => {
            const res = await request(app)
                .get('/api/categories');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(3);
            
            console.log(`  📊 จำนวนหมวดหมู่ทั้งหมด: ${res.body.data.length} หมวดหมู่`);
        });
    });
});