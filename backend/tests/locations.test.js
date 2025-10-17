// backend/tests/locations.test.js
// Test suite สำหรับระบบ Locations
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Location = require('../src/models/locationModel');

describe('🏢 Location System Tests', () => {

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

    describe('GET /api/locations/buildings - Get All Buildings', () => {

        it('should get all unique buildings', async () => {
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

        it('should return empty array when no locations exist', async () => {
            await Location.deleteMany({});

            const res = await request(app)
                .get('/api/locations/buildings');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    describe('GET /api/locations/floors/:building - Get Floors by Building', () => {

        it('should get all floors for a building', async () => {
            const res = await request(app)
                .get(`/api/locations/floors/${encodeURIComponent('อาคาร 1')}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(2);
            expect(res.body.data).to.include('1');
            expect(res.body.data).to.include('2');
        });

        it('should return empty array for non-existent building', async () => {
            const res = await request(app)
                .get(`/api/locations/floors/${encodeURIComponent('อาคารไม่มี')}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    describe('GET /api/locations/rooms/:building/:floor - Get Rooms', () => {

        it('should get all rooms for building and floor', async () => {
            const res = await request(app)
                .get(`/api/locations/rooms/${encodeURIComponent('อาคาร 1')}/1`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(2);
            expect(res.body.data).to.include('101');
            expect(res.body.data).to.include('102');
        });

        it('should return empty array for non-existent floor', async () => {
            const res = await request(app)
                .get(`/api/locations/rooms/${encodeURIComponent('อาคาร 1')}/99`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });

        it('should filter out empty rooms', async () => {
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

    describe('POST /api/locations - Create Location', () => {

        it('should create a new location successfully', async () => {
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

        it('should create location without room', async () => {
            const res = await request(app)
                .post('/api/locations')
                .send({
                    building: 'อาคาร Test',
                    floor: '1'
                });

            expect(res.status).to.equal(201);
            expect(res.body.data).to.have.property('room', '');
        });

        it('should fail when building is missing', async () => {
            const res = await request(app)
                .post('/api/locations')
                .send({
                    floor: '1'
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
            expect(res.body).to.have.property('error');
        });

        it('should fail when floor is missing', async () => {
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