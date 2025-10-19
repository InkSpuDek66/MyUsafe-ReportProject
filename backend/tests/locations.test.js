// backend/tests/locations.test.js
// Test suite สำหรับระบบ Locations
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Location = require('../src/models/locationModel');

describe('🏢 ทดสอบระบบตำแหน่งที่ตั้ง', () => {

    beforeEach(async () => {
        // สร้างข้อมูลทดสอบ
        await Location.create([
            { building: 'อาคาร 1', floor: '1', room: '101' },
            { building: 'อาคาร 1', floor: '1', room: '102' },
            { building: 'อาคาร 1', floor: '2', room: '201' },
            { building: 'อาคาร 2', floor: '1', room: '101' },
            { building: 'อาคาร 2', floor: '2', room: '201' },
            { building: 'หอพัก', floor: '3', room: '301' }
        ]);
    });

    describe('GET /api/locations/buildings - ดึงข้อมูลอาคารทั้งหมด', () => {

        it('ควรดึงอาคารที่ไม่ซ้ำกันทั้งหมด', async () => {
            const res = await request(app)
                .get('/api/locations/buildings');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(3);
            expect(res.body.data).to.include('อาคาร 1');
            expect(res.body.data).to.include('อาคาร 2');
            expect(res.body.data).to.include('หอพัก');
        });

        it('ควรคืนค่า array ว่างเมื่อไม่มีตำแหน่งที่ตั้ง', async () => {
            await Location.deleteMany({});

            const res = await request(app)
                .get('/api/locations/buildings');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    describe('GET /api/locations/floors/:building - ดึงข้อมูลชั้นตามอาคาร', () => {

        it('ควรดึงชั้นทั้งหมดของอาคาร', async () => {
            const res = await request(app)
                .get(`/api/locations/floors/${encodeURIComponent('อาคาร 1')}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(2);
            expect(res.body.data).to.include('1');
            expect(res.body.data).to.include('2');
        });

        it('ควรคืนค่า array ว่างสำหรับอาคารที่ไม่มีอยู่', async () => {
            const res = await request(app)
                .get(`/api/locations/floors/${encodeURIComponent('อาคารไม่มี')}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    describe('GET /api/locations/rooms/:building/:floor - ดึงข้อมูลห้อง', () => {

        it('ควรดึงห้องทั้งหมดของอาคารและชั้น', async () => {
            const res = await request(app)
                .get(`/api/locations/rooms/${encodeURIComponent('อาคาร 1')}/1`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(2);
            expect(res.body.data).to.include('101');
            expect(res.body.data).to.include('102');
        });

        it('ควรคืนค่า array ว่างสำหรับชั้นที่ไม่มีอยู่', async () => {
            const res = await request(app)
                .get(`/api/locations/rooms/${encodeURIComponent('อาคาร 1')}/99`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });

        it('ควรกรองห้องที่ว่างออก', async () => {
            // สร้าง location ที่ไม่มีห้อง
            await Location.create({
                building: 'อาคาร 3',
                floor: '1',
                room: ''
            });

            const res = await request(app)
                .get(`/api/locations/rooms/${encodeURIComponent('อาคาร 3')}/1`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    describe('POST /api/locations - สร้างตำแหน่งที่ตั้งใหม่', () => {

        it('ควรสร้างตำแหน่งที่ตั้งใหม่สำเร็จ', async () => {
            const locationData = {
                building: 'อาคารใหม่',
                floor: '5',
                room: '501'
            };

            const res = await request(app)
                .post('/api/locations')
                .send(locationData);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message');
            expect(res.body.data).to.have.property('building', locationData.building);
            expect(res.body.data).to.have.property('floor', locationData.floor);
            expect(res.body.data).to.have.property('room', locationData.room);
        });

        it('ควรสร้างตำแหน่งที่ตั้งโดยไม่มีห้อง', async () => {
            const res = await request(app)
                .post('/api/locations')
                .send({
                    building: 'อาคาร Test',
                    floor: '1'
                });

            expect(res.status).to.equal(201);
            expect(res.body.data).to.have.property('room', '');
        });

        it('ควรล้มเหลวเมื่อไม่มีชื่ออาคาร', async () => {
            const res = await request(app)
                .post('/api/locations')
                .send({
                    floor: '1'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body).to.have.property('error');
        });

        it('ควรล้มเหลวเมื่อไม่มีชั้น', async () => {
            const res = await request(app)
                .post('/api/locations')
                .send({
                    building: 'อาคาร Test'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
        });
    });
});