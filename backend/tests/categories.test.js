// backend/tests/categories.test.js
// Test suite for Categories
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Category = require('../src/models/categoryModel');

describe('ทดสอบ API Categories', () => {

    beforeEach(async () => {
        // เตรียมข้อมูลทดสอบ
        await Category.create([
            { name: 'ไฟฟ้า', description: 'ปัญหาเกี่ยวกับไฟฟ้า', icon: 'electric' },
            { name: 'ประปา', description: 'ปัญหาเกี่ยวกับระบบประปา', icon: 'water' },
            { name: 'ความสะอาด', description: 'ปัญหาเกี่ยวกับความสะอาด', icon: 'clean' }
        ]);
    });

    describe('GET /api/categories - ดึงรายการหมวดหมู่', () => {

        it('ควรดึงรายการหมวดหมู่ทั้งหมดได้', async () => {
            const res = await request(app)
                .get('/api/categories');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(3);

            // ตรวจสอบว่ามี property name
            expect(res.body.data[0]).to.have.property('name');
            expect(res.body.data[0]).to.have.property('description');
        });

        it('ควร return array ว่างถ้าไม่มีข้อมูล', async () => {
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
        });

        it('ควรล้มเหลวถ้าไม่ระบุชื่อหมวดหมู่', async () => {
            const categoryData = {
                description: 'Test description'
            };

            const res = await request(app)
                .post('/api/categories')
                .send(categoryData);

            expect(res.status).to.equal(400);
        });

        it('ควรล้มเหลวถ้าชื่อซ้ำ', async () => {
            const categoryData = {
                name: 'ไฟฟ้า',
                description: 'ซ้ำ'
            };

            const res = await request(app)
                .post('/api/categories')
                .send(categoryData);

            expect(res.status).to.equal(400);
        });
    });

    describe('PUT /api/categories/:id - อัพเดทหมวดหมู่', () => {

        it('ควรอัพเดทหมวดหมู่สำเร็จ', async () => {
            // ค้นหา category ที่ต้องการอัพเดท
            const category = await Category.findOne({ name: 'ไฟฟ้า' });

            // รอให้แน่ใจว่า category ถูกสร้างแล้ว
            await new Promise(resolve => setTimeout(resolve, 100));

            const res = await request(app)
                .put(`/api/categories/${category._id}`)
                .send({
                    description: 'คำอธิบายใหม่สำหรับไฟฟ้า'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('description', 'คำอธิบายใหม่สำหรับไฟฟ้า');
        });

        it('ควร return 404 ถ้าไม่พบหมวดหมู่', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .put(`/api/categories/${fakeId}`)
                .send({
                    description: 'Test'
                });

            expect(res.status).to.equal(404);
        });
    });

    describe('DELETE /api/categories/:id - ลบหมวดหมู่', () => {

        it('ควรลบหมวดหมู่สำเร็จ', async () => {
            // ค้นหา category ที่ต้องการลบ
            const category = await Category.findOne({ name: 'ไฟฟ้า' });

            // รอให้แน่ใจว่า category ถูกสร้างแล้ว
            await new Promise(resolve => setTimeout(resolve, 100));

            const res = await request(app)
                .delete(`/api/categories/${category._id}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
        });
    });
});