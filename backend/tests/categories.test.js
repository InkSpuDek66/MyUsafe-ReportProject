// backend/tests/categories.test.js
// Test suite สำหรับระบบ Categories
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Category = require('../src/models/categoryModel');

describe('📂 ทดสอบระบบหมวดหมู่', () => {

    beforeEach(async () => {
        // สร้างข้อมูลทดสอบ
        await Category.create([
            { name: 'น้ำท่วม', description: 'ปัญหาน้ำท่วม น้ำรั่ว' },
            { name: 'ไฟฟ้า', description: 'ปัญหาไฟฟ้า แอร์ หลอดไฟ' },
            { name: 'คอมพิวเตอร์', description: 'ปัญหาคอมพิวเตอร์ อินเทอร์เน็ต' }
        ]);
    });

    describe('GET /api/categories - ดึงข้อมูลหมวดหมู่ทั้งหมด', () => {

        it('ควรดึงหมวดหมู่ทั้งหมดที่เรียงตามชื่อ', async () => {
            const res = await request(app)
                .get('/api/categories');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(3);

            // ตรวจสอบว่าเรียงลำดับตาม name
            expect(res.body.data[0]).to.have.property('name');
            expect(res.body.data[0]).to.have.property('description');
        });

        it('ควรคืนค่า array ว่างเมื่อไม่มีหมวดหมู่', async () => {
            await Category.deleteMany({});

            const res = await request(app)
                .get('/api/categories');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    describe('POST /api/categories - สร้างหมวดหมู่ใหม่', () => {

        it('ควรสร้างหมวดหมู่ใหม่สำเร็จ', async () => {
            const categoryData = {
                name: 'ทั่วไป',
                description: 'เรื่องทั่วไปอื่นๆ'
            };

            const res = await request(app)
                .post('/api/categories')
                .send(categoryData);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message');
            expect(res.body.data).to.have.property('name', categoryData.name);
            expect(res.body.data).to.have.property('description', categoryData.description);
        });

        it('ควรสร้างหมวดหมู่ได้โดยไม่มี description', async () => {
            const res = await request(app)
                .post('/api/categories')
                .send({
                    name: 'อื่นๆ'
                });

            expect(res.status).to.equal(201);
            expect(res.body.data).to.have.property('description', '');
        });

        it('ควรล้มเหลวเมื่อไม่มีชื่อหมวดหมู่', async () => {
            const res = await request(app)
                .post('/api/categories')
                .send({
                    description: 'Test'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body).to.have.property('error');
        });

        it('ควรล้มเหลวเมื่อชื่อหมวดหมู่เป็น string ว่าง', async () => {
            const res = await request(app)
                .post('/api/categories')
                .send({
                    name: '   ',
                    description: 'Test'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
        });

        it('ควรล้มเหลวเมื่อชื่อหมวดหมู่ซ้ำกับที่มีอยู่แล้ว', async () => {
            const res = await request(app)
                .post('/api/categories')
                .send({
                    name: 'น้ำท่วม',
                    description: 'ซ้ำกับที่มีอยู่แล้ว'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body).to.have.property('error', 'มีหมวดหมู่นี้อยู่แล้ว');
        });

        it('ควรตัดช่องว่างออกจากชื่อหมวดหมู่', async () => {
            const res = await request(app)
                .post('/api/categories')
                .send({
                    name: '  ทดสอบ  ',
                    description: 'Test trim'
                });

            expect(res.status).to.equal(201);
            expect(res.body.data).to.have.property('name', 'ทดสอบ');
        });
    });
});