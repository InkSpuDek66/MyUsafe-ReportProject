// backend/tests/categories.test.js
// Test suite สำหรับระบบ Categories
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Category = require('../src/models/categoryModel');

describe('📂 Category System Tests', () => {

    beforeEach(async () => {
        // สร้างข้อมูลทดสอบ
        await Category.create([
            { name: 'น้ำท่วม', description: 'ปัญหาน้ำท่วม น้ำรั่ว' },
            { name: 'ไฟฟ้า', description: 'ปัญหาไฟฟ้า แอร์ หลอดไฟ' },
            { name: 'คอมพิวเตอร์', description: 'ปัญหาคอมพิวเตอร์ อินเทอร์เน็ต' }
        ]);
    });

    describe('GET /api/categories - Get All Categories', () => {

        it('should get all categories sorted by name', async () => {
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

        it('should return empty array when no categories exist', async () => {
            await Category.deleteMany({});

            const res = await request(app)
                .get('/api/categories');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    describe('POST /api/categories - Create Category', () => {

        it('should create a new category successfully', async () => {
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

        it('should create category without description', async () => {
            const res = await request(app)
                .post('/api/categories')
                .send({
                    name: 'อื่นๆ'
                });

            expect(res.status).to.equal(201);
            expect(res.body.data).to.have.property('description', '');
        });

        it('should fail when name is missing', async () => {
            const res = await request(app)
                .post('/api/categories')
                .send({
                    description: 'Test'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body).to.have.property('error');
        });

        it('should fail when name is empty string', async () => {
            const res = await request(app)
                .post('/api/categories')
                .send({
                    name: '   ',
                    description: 'Test'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
        });

        it('should fail when category name already exists', async () => {
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

        it('should trim whitespace from name', async () => {
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