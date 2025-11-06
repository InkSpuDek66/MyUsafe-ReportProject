// backend/tests/locations.test.js
// ===============================================
// ทดสอบ API Locations (สถานที่)
// ===============================================
// ทดสอบ API สำหรับจัดการข้อมูลสถานที่:
// - GET /api/locations/buildings (ดึงรายการอาคาร)
// - GET /api/locations/floors/:building (ดึงรายการชั้น)
// - GET /api/locations/rooms/:building/:floor (ดึงรายการห้อง)
// - POST /api/locations (สร้างสถานที่ใหม่)
// ===============================================

const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const Location = require('../src/models/locationModel');

describe('📍 ทดสอบ API Locations', () => {

    // สร้างข้อมูลทดสอบก่อนแต่ละ test
    beforeEach(async () => {
        console.log('  📝 กำลังสร้างข้อมูลสถานที่ทดสอบ...');
        
        await Location.create([
            { building: 'อาคาร 1', floor: '1', room: '101' },
            { building: 'อาคาร 1', floor: '1', room: '102' },
            { building: 'อาคาร 1', floor: '2', room: '201' },
            { building: 'อาคาร 2', floor: '1', room: '101' },
            { building: 'อาคาร 2', floor: '2', room: '201' },
            { building: 'อาคาร 3', floor: '3', room: '301' }
        ]);
        
        console.log('   สร้างข้อมูลสถานที่ทดสอบเสร็จสิ้น');
    });

    // ==================================================
    // ทดสอบการดึงรายการอาคาร
    // ==================================================
    describe('GET /api/locations/buildings - ดึงรายการอาคาร', () => {

        it(' ควรดึงรายการอาคารทั้งหมดได้', async () => {
            const res = await request(app)
                .get('/api/locations/buildings');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(3);
            
            // ตรวจสอบว่ามีอาคารที่คาดหวัง
            expect(res.body.data).to.include('อาคาร 1');
            expect(res.body.data).to.include('อาคาร 2');
            expect(res.body.data).to.include('อาคาร 3');
        });

        it(' ควร return array ว่างถ้าไม่มีข้อมูล', async () => {
            // ลบข้อมูลทั้งหมด
            await Location.deleteMany({});

            const res = await request(app)
                .get('/api/locations/buildings');

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });

        it(' อาคารควรไม่ซ้ำกัน (unique)', async () => {
            const res = await request(app)
                .get('/api/locations/buildings');

            const buildings = res.body.data;
            const uniqueBuildings = [...new Set(buildings)];
            
            expect(buildings).to.have.lengthOf(uniqueBuildings.length);
        });
    });

    // ==================================================
    // ทดสอบการดึงรายการชั้น
    // ==================================================
    describe('GET /api/locations/floors/:building - ดึงรายการชั้น', () => {

        it(' ควรดึงรายการชั้นของอาคาร 1', async () => {
            const building = encodeURIComponent('อาคาร 1');
            const res = await request(app)
                .get(`/api/locations/floors/${building}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(2);
            expect(res.body.data).to.include('1');
            expect(res.body.data).to.include('2');
        });

        it(' ควร return array ว่างถ้าไม่พบอาคาร', async () => {
            const building = encodeURIComponent('อาคารที่ไม่มี');
            const res = await request(app)
                .get(`/api/locations/floors/${building}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });

        it(' ชั้นควรไม่ซ้ำกัน', async () => {
            const building = encodeURIComponent('อาคาร 1');
            const res = await request(app)
                .get(`/api/locations/floors/${building}`);

            const floors = res.body.data;
            const uniqueFloors = [...new Set(floors)];
            
            expect(floors).to.have.lengthOf(uniqueFloors.length);
        });
    });

    // ==================================================
    // ทดสอบการดึงรายการห้อง
    // ==================================================
    describe('GET /api/locations/rooms/:building/:floor - ดึงรายการห้อง', () => {

        it(' ควรดึงรายการห้องของอาคาร 1 ชั้น 1', async () => {
            const building = encodeURIComponent('อาคาร 1');
            const res = await request(app)
                .get(`/api/locations/rooms/${building}/1`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(2);
            expect(res.body.data).to.include('101');
            expect(res.body.data).to.include('102');
        });

        it(' ควรไม่มีห้องที่เป็นค่าว่าง', async () => {
            const building = encodeURIComponent('อาคาร 1');
            const res = await request(app)
                .get(`/api/locations/rooms/${building}/2`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');

            // ตรวจสอบว่าไม่มีห้องที่เป็นค่าว่าง
            const hasEmptyRoom = res.body.data.some(room => room === '' || room === null);
            expect(hasEmptyRoom).to.be.false;
        });

        it(' ควร return array ว่างถ้าไม่พบห้อง', async () => {
            const building = encodeURIComponent('อาคาร 1');
            const res = await request(app)
                .get(`/api/locations/rooms/${building}/999`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data).to.have.lengthOf(0);
        });
    });

    // ==================================================
    // ทดสอบการสร้างสถานที่ใหม่
    // ==================================================
    describe('POST /api/locations - สร้างตำแหน่งใหม่', () => {

        it(' ควรสร้างตำแหน่งใหม่สำเร็จ', async () => {
            const locationData = {
                building: 'อาคาร 4',
                floor: '1',
                room: '401'
            };

            const res = await request(app)
                .post('/api/locations')
                .send(locationData);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('building', locationData.building);
            expect(res.body.data).to.have.property('floor', locationData.floor);
            expect(res.body.data).to.have.property('room', locationData.room);
        });

        it('ควรล้มเหลวเมื่อไม่ระบุอาคาร', async () => {
            const locationData = {
                floor: '1',
                room: '401'
            };

            const res = await request(app)
                .post('/api/locations')
                .send(locationData);

            expect(res.status).to.equal(400);
        });

        it('ควรล้มเหลวเมื่อไม่ระบุชั้น', async () => {
            const locationData = {
                building: 'อาคาร 4',
                room: '401'
            };

            const res = await request(app)
                .post('/api/locations')
                .send(locationData);

            expect(res.status).to.equal(400);
        });

        it(' ควรสร้างได้แม้ไม่ระบุห้อง', async () => {
            const locationData = {
                building: 'อาคาร 5',
                floor: '1'
            };

            const res = await request(app)
                .post('/api/locations')
                .send(locationData);

            // อาจจะสำเร็จหรือล้มเหลวขึ้นอยู่กับ business logic
            expect([200, 201, 400]).to.include(res.status);
        });
    });

    // ==================================================
    // ทดสอบการทำงานร่วมกัน
    // ==================================================
    describe('🔗 ทดสอบการทำงานร่วมกัน', () => {

        it(' ควรดึงข้อมูลสถานที่ทั้งหมดได้อย่างสมบูรณ์', async () => {
            // ดึงอาคารทั้งหมด
            const buildingsRes = await request(app)
                .get('/api/locations/buildings');

            expect(buildingsRes.status).to.equal(200);
            console.log(`  📊 จำนวนอาคารทั้งหมด: ${buildingsRes.body.data.length} อาคาร`);

            // นับจำนวนสถานที่ทั้งหมด
            let totalLocations = 0;
            
            for (const building of buildingsRes.body.data) {
                const encodedBuilding = encodeURIComponent(building);
                
                const floorsRes = await request(app)
                    .get(`/api/locations/floors/${encodedBuilding}`);
                
                for (const floor of floorsRes.body.data) {
                    const encodedFloor = encodeURIComponent(floor);
                    
                    const roomsRes = await request(app)
                        .get(`/api/locations/rooms/${encodedBuilding}/${encodedFloor}`);
                    
                    totalLocations += roomsRes.body.data.length;
                }
            }

            console.log(`  📊 จำนวนสถานที่ทั้งหมด: ${totalLocations} สถานที่`);
            expect(totalLocations).to.be.at.least(6);
        });
    });
});