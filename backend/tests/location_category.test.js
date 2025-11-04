// backend/tests/location_category.test.js
// Test file สำหรับทดสอบ Location และ Category API

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');
const Location = require('../src/models/locationModel');
const Category = require('../src/models/categoryModel');

describe('Location API Tests', function () {
    this.timeout(10000);

    // Seed ข้อมูลใน beforeEach แทน before เพื่อให้แน่ใจว่ามีข้อมูลทุกครั้ง
    beforeEach(async () => {
        await Location.deleteMany({});
        await Location.insertMany([
            { building: 'อาคาร 1', floor: '1', room: '101' },
            { building: 'อาคาร 1', floor: '1', room: '102' },
            { building: 'อาคาร 1', floor: '2', room: '201' },
            { building: 'อาคาร 1', floor: '2', room: '202' },
            { building: 'อาคาร 2', floor: '1', room: '101' }
        ]);
    });

    describe('GET /api/locations/buildings', () => {
        it('ควรดึงรายการอาคารทั้งหมดได้', async () => {
            const res = await request(app)
                .get('/api/locations/buildings')
                .expect(200);
            
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.be.greaterThan(0);

            console.log('Buildings:', res.body.data.length, 'อาคาร');
            console.log('   ตัวอย่าง:', res.body.data.slice(0, 3));
        });

        it('อาคารควรเป็น string', async () => {
            const res = await request(app)
                .get('/api/locations/buildings')
                .expect(200);
            
            expect(res.body.data).to.be.an('array');
            if (res.body.data.length > 0) {
                expect(res.body.data[0]).to.be.a('string');
            }
        });
    });

    describe('GET /api/locations/floors/:building', () => {
        it('ควรดึงรายการชั้นของอาคาร 1 ได้', async () => {
            const building = encodeURIComponent('อาคาร 1');
            const res = await request(app)
                .get(`/api/locations/floors/${building}`)
                .expect(200);
            
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.be.greaterThan(0);

            console.log('Floors (อาคาร 1):', res.body.data.length, 'ชั้น');
            console.log('   ตัวอย่าง:', res.body.data.slice(0, 5));
        });

        it('ควร return [] ถ้าไม่มีอาคาร', async () => {
            const building = encodeURIComponent('อาคารที่ไม่มี');
            const res = await request(app)
                .get(`/api/locations/floors/${building}`)
                .expect(200);
            
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.equal(0);
        });
    });

    describe('GET /api/locations/rooms/:building/:floor', () => {
        it('ควรดึงรายการห้องของอาคาร 1 ชั้น 2 ได้', async () => {
            const building = encodeURIComponent('อาคาร 1');
            const floor = encodeURIComponent('2');
            const res = await request(app)
                .get(`/api/locations/rooms/${building}/${floor}`)
                .expect(200);
            
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.be.greaterThan(0);

            console.log('Rooms (อาคาร 1, ชั้น 2):', res.body.data.length, 'ห้อง');
            console.log('   ตัวอย่าง:', res.body.data.slice(0, 5));
        });

        it('ควรไม่มีห้องว่าง (empty string)', async () => {
            const building = encodeURIComponent('อาคาร 1');
            const floor = encodeURIComponent('2');
            const res = await request(app)
                .get(`/api/locations/rooms/${building}/${floor}`)
                .expect(200);
            
            const hasEmptyRoom = res.body.data.some(room => room === '');
            expect(hasEmptyRoom).to.be.false;
        });
    });
});

describe('Category API Tests', function () {
    this.timeout(10000);

    // Seed ข้อมูลใน beforeEach แทน before
    beforeEach(async () => {
        await Category.deleteMany({});
        await Category.insertMany([
            { name: 'น้ำท่วม', icon: 'water', description: 'เรื่องร้องเรียนเกี่ยวกับน้ำท่วม' },
            { name: 'ไฟฟ้า', icon: 'electric', description: 'เรื่องร้องเรียนเกี่ยวกับไฟฟ้า' },
            { name: 'คอมพิวเตอร์/เว็บไซต์', icon: 'computer', description: 'เรื่องร้องเรียนเกี่ยวกับคอมพิวเตอร์และเว็บไซต์' },
            { name: 'ประปา/ท่อน้ำ', icon: 'water-pipe', description: 'เรื่องร้องเรียนเกี่ยวกับประปาและท่อน้ำ' },
            { name: 'สิ่งอำนวยความสะดวก', icon: 'facility', description: 'เรื่องร้องเรียนเกี่ยวกับสิ่งอำนวยความสะดวก' },
            { name: 'ความสะอาด', icon: 'clean', description: 'เรื่องร้องเรียนเกี่ยวกับความสะอาด' },
            { name: 'ความปลอดภัย', icon: 'security', description: 'เรื่องร้องเรียนเกี่ยวกับความปลอดภัย' },
            { name: 'อื่นๆ', icon: 'other', description: 'เรื่องร้องเรียนอื่นๆ' }
        ]);
    });

    describe('GET /api/categories', () => {
        it('ควรดึงรายการหมวดหมู่ทั้งหมดได้', async () => {
            const res = await request(app)
                .get('/api/categories')
                .expect(200);
            
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.be.greaterThan(0);

            console.log('Categories:', res.body.data.length, 'หมวดหมู่');
        });

        it('แต่ละ category ควรมี required fields', async () => {
            const res = await request(app)
                .get('/api/categories')
                .expect(200);
            
            expect(res.body.data).to.be.an('array');
            if (res.body.data.length > 0) {
                const firstCategory = res.body.data[0];

                expect(firstCategory).to.have.property('name');
                expect(firstCategory).to.have.property('icon');
                expect(firstCategory).to.have.property('description');

                console.log('Category Structure:', {
                    name: firstCategory.name,
                    icon: firstCategory.icon,
                    hasDescription: !!firstCategory.description
                });
            }
        });

        it('ควรมีหมวดหมู่ที่คาดหวัง', async () => {
            const res = await request(app)
                .get('/api/categories')
                .expect(200);
            
            const categoryNames = res.body.data.map(cat => cat.name);

            const expectedCategories = [
                'น้ำท่วม',
                'ไฟฟ้า',
                'คอมพิวเตอร์/เว็บไซต์',
                'ประปา/ท่อน้ำ',
                'สิ่งอำนวยความสะดวก',
                'ความสะอาด',
                'ความปลอดภัย',
                'อื่นๆ'
            ];

            expectedCategories.forEach(expectedCat => {
                expect(categoryNames).to.include(expectedCat);
            });

            console.log('All expected categories found');
            console.log('   Categories:', categoryNames);
        });
    });
});

describe('Integration Tests', function () {
    this.timeout(10000);

    beforeEach(async () => {
        // Seed ข้อมูล location และ category ก่อนทุก test
        await Location.deleteMany({});
        await Location.insertMany([
            { building: 'อาคาร 1', floor: '1', room: '101' },
            { building: 'อาคาร 1', floor: '2', room: '201' }
        ]);

        await Category.deleteMany({});
        await Category.insertMany([
            { name: 'น้ำท่วม', icon: 'water', description: 'ปัญหาน้ำท่วม' },
            { name: 'ไฟฟ้า', icon: 'electric', description: 'ปัญหาไฟฟ้า' }
        ]);
    });

    it('ควรสามารถสร้าง complaint flow ด้วยข้อมูลจริงได้', async function () {
        // 1. ดึง categories
        const categoriesRes = await request(app)
            .get('/api/categories')
            .expect(200);

        expect(categoriesRes.body.success).to.be.true;
        const categories = categoriesRes.body.data;
        expect(categories.length).to.be.greaterThan(0);

        console.log('Step 1: Got', categories.length, 'categories');

        // 2. ดึง buildings
        const buildingsRes = await request(app)
            .get('/api/locations/buildings')
            .expect(200);

        expect(buildingsRes.body.success).to.be.true;
        const buildings = buildingsRes.body.data;
        expect(buildings.length).to.be.greaterThan(0);

        console.log('Step 2: Got', buildings.length, 'buildings');

        // 3. ดึง floors ของ building แรก
        const firstBuilding = buildings[0];
        const encodedBuilding = encodeURIComponent(firstBuilding);
        const floorsRes = await request(app)
            .get(`/api/locations/floors/${encodedBuilding}`)
            .expect(200);

        expect(floorsRes.body.success).to.be.true;
        const floors = floorsRes.body.data;
        expect(floors.length).to.be.greaterThan(0);

        console.log('Step 3: Got', floors.length, 'floors for', firstBuilding);

        // 4. ดึง rooms ของ floor แรก
        const firstFloor = floors[0];
        const encodedFloor = encodeURIComponent(firstFloor);
        const roomsRes = await request(app)
            .get(`/api/locations/rooms/${encodedBuilding}/${encodedFloor}`)
            .expect(200);

        expect(roomsRes.body.success).to.be.true;
        const rooms = roomsRes.body.data;

        console.log('Step 4: Got', rooms.length, 'rooms for', firstBuilding, firstFloor);

        console.log('\nIntegration test passed!');
        console.log('   Sample data for complaint:');
        console.log('   - Category:', categories[0].name);
        console.log('   - Building:', firstBuilding);
        console.log('   - Floor:', firstFloor);
        console.log('   - Room:', rooms[0] || 'N/A');
    });
});

// สรุปผลการทดสอบ
describe('Summary', function () {
    beforeEach(async () => {
        // Seed ข้อมูลก่อนทดสอบ
        await Category.deleteMany({});
        await Category.insertMany([
            { name: 'น้ำท่วม', icon: 'water', description: 'ปัญหาน้ำท่วม' },
            { name: 'ไฟฟ้า', icon: 'electric', description: 'ปัญหาไฟฟ้า' }
        ]);

        await Location.deleteMany({});
        await Location.insertMany([
            { building: 'อาคาร 1', floor: '1', room: '101' },
            { building: 'อาคาร 2', floor: '1', room: '101' }
        ]);
    });

    it('แสดงสรุปข้อมูลในระบบ', async function () {
        const [categoriesRes, buildingsRes] = await Promise.all([
            request(app).get('/api/categories').expect(200),
            request(app).get('/api/locations/buildings').expect(200)
        ]);

        console.log('\n' + '='.repeat(60));
        console.log('SYSTEM DATA SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Categories: ${categoriesRes.body.data.length}`);
        console.log(`Total Buildings: ${buildingsRes.body.data.length}`);

        // นับจำนวน locations ทั้งหมด
        let totalLocations = 0;
        for (const building of buildingsRes.body.data) {
            const encodedBuilding = encodeURIComponent(building);
            const floorsRes = await request(app)
                .get(`/api/locations/floors/${encodedBuilding}`)
                .expect(200);

            for (const floor of floorsRes.body.data) {
                const encodedFloor = encodeURIComponent(floor);
                const roomsRes = await request(app)
                    .get(`/api/locations/rooms/${encodedBuilding}/${encodedFloor}`)
                    .expect(200);
                totalLocations += roomsRes.body.data.length;
            }
        }

        console.log(`Total Locations: ${totalLocations}`);
        console.log('='.repeat(60));
        console.log('All APIs are working correctly!');
        console.log('='.repeat(60) + '\n');
    });
});
