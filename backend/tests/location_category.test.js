// backend/tests/location_category.test.js
// ===============================================
// ทดสอบ Location และ Category APIs แบบรวม
// ===============================================
// ทดสอบความสัมพันธ์ระหว่าง Location และ Category
// และการทำงานร่วมกันของทั้งสอง API
// ===============================================

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../server');
const Location = require('../src/models/locationModel');
const Category = require('../src/models/categoryModel');

describe('📍📁 Location และ Category API Tests', function () {
    this.timeout(10000);

    // ==================================================
    // Location API Tests
    // ==================================================
    describe('Location API Tests', () => {

        // Seed ข้อมูลใน beforeEach
        beforeEach(async () => {
            console.log('  📍 กำลังสร้างข้อมูล Locations...');
            
            await Location.deleteMany({});
            await Location.insertMany([
                { building: 'อาคาร 1', floor: '1', room: '101' },
                { building: 'อาคาร 1', floor: '1', room: '102' },
                { building: 'อาคาร 1', floor: '2', room: '201' },
                { building: 'อาคาร 1', floor: '2', room: '202' },
                { building: 'อาคาร 2', floor: '1', room: '101' }
            ]);
            
            console.log('   สร้างข้อมูล Locations เสร็จสิ้น');
        });

        describe('GET /api/locations/buildings', () => {
            it(' ควรดึงรายการอาคารทั้งหมดได้', async () => {
                const res = await request(app)
                    .get('/api/locations/buildings')
                    .expect(200);
                
                expect(res.body).to.have.property('success', true);
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.be.an('array');
                expect(res.body.data.length).to.be.greaterThan(0);

                console.log(`  📊 พบ ${res.body.data.length} อาคาร`);
            });

            it(' อาคารควรเป็น string', async () => {
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
            it(' ควรดึงรายการชั้นของอาคาร 1 ได้', async () => {
                const building = encodeURIComponent('อาคาร 1');
                const res = await request(app)
                    .get(`/api/locations/floors/${building}`)
                    .expect(200);
                
                expect(res.body).to.have.property('success', true);
                expect(res.body.data).to.be.an('array');
                expect(res.body.data.length).to.be.greaterThan(0);

                console.log(`  📊 พบ ${res.body.data.length} ชั้นในอาคาร 1`);
            });

            it(' ควร return [] ถ้าไม่มีอาคาร', async () => {
                const building = encodeURIComponent('อาคารที่ไม่มี');
                const res = await request(app)
                    .get(`/api/locations/floors/${building}`)
                    .expect(200);
                
                expect(res.body.data).to.be.an('array');
                expect(res.body.data.length).to.equal(0);
            });
        });

        describe('GET /api/locations/rooms/:building/:floor', () => {
            it(' ควรดึงรายการห้องของอาคาร 1 ชั้น 2 ได้', async () => {
                const building = encodeURIComponent('อาคาร 1');
                const floor = encodeURIComponent('2');
                const res = await request(app)
                    .get(`/api/locations/rooms/${building}/${floor}`)
                    .expect(200);
                
                expect(res.body).to.have.property('success', true);
                expect(res.body.data).to.be.an('array');
                expect(res.body.data.length).to.be.greaterThan(0);

                console.log(`  📊 พบ ${res.body.data.length} ห้องในอาคาร 1 ชั้น 2`);
            });

            it(' ควรไม่มีห้องว่าง (empty string)', async () => {
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

    // ==================================================
    // Category API Tests
    // ==================================================
    describe('Category API Tests', () => {

        // Seed ข้อมูลใน beforeEach
        beforeEach(async () => {
            console.log('  📁 กำลังสร้างข้อมูล Categories...');
            
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
            
            console.log('   สร้างข้อมูล Categories เสร็จสิ้น');
        });

        describe('GET /api/categories', () => {
            it(' ควรดึงรายการหมวดหมู่ทั้งหมดได้', async () => {
                const res = await request(app)
                    .get('/api/categories')
                    .expect(200);
                
                expect(res.body).to.have.property('success', true);
                expect(res.body.data).to.be.an('array');
                expect(res.body.data.length).to.be.greaterThan(0);

                console.log(`  📊 พบ ${res.body.data.length} หมวดหมู่`);
            });

            it(' แต่ละ category ควรมี required fields', async () => {
                const res = await request(app)
                    .get('/api/categories')
                    .expect(200);
                
                expect(res.body.data).to.be.an('array');
                if (res.body.data.length > 0) {
                    const firstCategory = res.body.data[0];

                    expect(firstCategory).to.have.property('name');
                    expect(firstCategory).to.have.property('icon');
                    expect(firstCategory).to.have.property('description');
                }
            });

            it(' ควรมีหมวดหมู่ที่คาดหวัง', async () => {
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

                console.log('   พบหมวดหมู่ครบทุกตัว');
            });
        });
    });

    // ==================================================
    // Integration Tests
    // ==================================================
    describe('Integration Tests', () => {

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

        it(' ควรสามารถใช้ข้อมูลร่วมกันในการสร้าง complaint ได้', async function () {
            console.log('  🔄 กำลังทดสอบการใช้งานร่วมกัน...');
            
            // 1. ดึง categories
            const categoriesRes = await request(app)
                .get('/api/categories')
                .expect(200);

            expect(categoriesRes.body.success).to.be.true;
            const categories = categoriesRes.body.data;
            expect(categories.length).to.be.greaterThan(0);

            console.log(`  📁 พบ ${categories.length} หมวดหมู่`);

            // 2. ดึง buildings
            const buildingsRes = await request(app)
                .get('/api/locations/buildings')
                .expect(200);

            expect(buildingsRes.body.success).to.be.true;
            const buildings = buildingsRes.body.data;
            expect(buildings.length).to.be.greaterThan(0);

            console.log(`  📍 พบ ${buildings.length} อาคาร`);

            // 3. ดึง floors ของ building แรก
            const firstBuilding = buildings[0];
            const encodedBuilding = encodeURIComponent(firstBuilding);
            const floorsRes = await request(app)
                .get(`/api/locations/floors/${encodedBuilding}`)
                .expect(200);

            expect(floorsRes.body.success).to.be.true;
            const floors = floorsRes.body.data;
            expect(floors.length).to.be.greaterThan(0);

            console.log(`  📍 พบ ${floors.length} ชั้นใน ${firstBuilding}`);

            // 4. ดึง rooms ของ floor แรก
            const firstFloor = floors[0];
            const encodedFloor = encodeURIComponent(firstFloor);
            const roomsRes = await request(app)
                .get(`/api/locations/rooms/${encodedBuilding}/${encodedFloor}`)
                .expect(200);

            expect(roomsRes.body.success).to.be.true;
            const rooms = roomsRes.body.data;

            console.log(`  📍 พบ ${rooms.length} ห้องใน ${firstBuilding} ชั้น ${firstFloor}`);

            console.log('   Integration test ผ่านเรียบร้อย!');
            console.log(`  ℹ️  ข้อมูลตัวอย่าง:`);
            console.log(`     - หมวดหมู่: ${categories[0].name}`);
            console.log(`     - อาคาร: ${firstBuilding}`);
            console.log(`     - ชั้น: ${firstFloor}`);
            console.log(`     - ห้อง: ${rooms[0] || 'ไม่มี'}`);
        });
    });

    // ==================================================
    // Summary
    // ==================================================
    describe('สรุปข้อมูลในระบบ', () => {
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

        it('📈 แสดงสรุปข้อมูลในระบบ', async function () {
            const [categoriesRes, buildingsRes] = await Promise.all([
                request(app).get('/api/categories').expect(200),
                request(app).get('/api/locations/buildings').expect(200)
            ]);

            console.log('\n' + '='.repeat(60));
            console.log('📊 สรุปข้อมูลในระบบ');
            console.log('='.repeat(60));
            console.log(`📁 จำนวนหมวดหมู่: ${categoriesRes.body.data.length}`);
            console.log(`📍 จำนวนอาคาร: ${buildingsRes.body.data.length}`);

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

            console.log(`📍 จำนวนสถานที่ทั้งหมด: ${totalLocations}`);
            console.log('='.repeat(60));
            console.log(' APIs ทั้งหมดทำงานได้ถูกต้อง!');
            console.log('='.repeat(60) + '\n');
        });
    });
});