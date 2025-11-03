// backend/tests/location_category.test.js
// Test file สำหรับทดสอบ Location และ Category API (ใช้ supertest)

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

// Import server app
const app = require('../server');

describe('🏢 Location API Tests', function () {
    this.timeout(10000);

    describe('GET /api/locations/buildings', () => {
        it('ควรดึงรายการอาคารทั้งหมดได้', (done) => {
            request(app)
                .get('/api/locations/buildings')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    
                    expect(res.body).to.have.property('success', true);
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.be.greaterThan(0);

                    console.log('✅ Buildings:', res.body.data.length, 'อาคาร');
                    console.log('   ตัวอย่าง:', res.body.data.slice(0, 3));

                    done();
                });
        });

        it('อาคารควรเป็น string', (done) => {
            request(app)
                .get('/api/locations/buildings')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body.data[0]).to.be.a('string');
                    done();
                });
        });
    });

    describe('GET /api/locations/floors/:building', () => {
        it('ควรดึงรายการชั้นของอาคาร 1 ได้', (done) => {
            request(app)
                .get('/api/locations/floors/อาคาร 1')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.be.greaterThan(0);

                    console.log('✅ Floors (อาคาร 1):', res.body.data.length, 'ชั้น');
                    console.log('   ตัวอย่าง:', res.body.data.slice(0, 5));

                    done();
                });
        });

        it('ควร return [] ถ้าไม่มีอาคาร', (done) => {
            request(app)
                .get('/api/locations/floors/อาคารที่ไม่มี')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.equal(0);
                    done();
                });
        });
    });

    describe('GET /api/locations/rooms/:building/:floor', () => {
        it('ควรดึงรายการห้องของอาคาร 1 ชั้น 2 ได้', (done) => {
            request(app)
                .get('/api/locations/rooms/อาคาร 1/ชั้น 2')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.be.greaterThan(0);

                    console.log('✅ Rooms (อาคาร 1, ชั้น 2):', res.body.data.length, 'ห้อง');
                    console.log('   ตัวอย่าง:', res.body.data.slice(0, 5));

                    done();
                });
        });

        it('ควรไม่มีห้องว่าง (empty string)', (done) => {
            request(app)
                .get('/api/locations/rooms/อาคาร 1/ชั้น 2')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    const hasEmptyRoom = res.body.data.some(room => room === '');
                    expect(hasEmptyRoom).to.be.false;
                    done();
                });
        });
    });
});

describe('📂 Category API Tests', function () {
    this.timeout(10000);

    describe('GET /api/categories', () => {
        it('ควรดึงรายการหมวดหมู่ทั้งหมดได้', (done) => {
            request(app)
                .get('/api/categories')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.data).to.be.an('array');
                    expect(res.body.data.length).to.be.greaterThan(0);

                    console.log('✅ Categories:', res.body.data.length, 'หมวดหมู่');

                    done();
                });
        });

        it('แต่ละ category ควรมี required fields', (done) => {
            request(app)
                .get('/api/categories')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    
                    const firstCategory = res.body.data[0];

                    expect(firstCategory).to.have.property('name');
                    expect(firstCategory).to.have.property('icon');
                    expect(firstCategory).to.have.property('description');

                    console.log('✅ Category Structure:', {
                        name: firstCategory.name,
                        icon: firstCategory.icon,
                        hasDescription: !!firstCategory.description
                    });

                    done();
                });
        });

        it('ควรมีหมวดหมู่ที่คาดหวัง', (done) => {
            request(app)
                .get('/api/categories')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    
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

                    console.log('✅ All expected categories found');
                    console.log('   Categories:', categoryNames);

                    done();
                });
        });
    });
});

describe('🔗 Integration Tests', function () {
    this.timeout(10000);

    it('ควรสามารถสร้าง complaint flow ด้วยข้อมูลจริงได้', async function () {
        // 1. ดึง categories
        const categoriesRes = await request(app)
            .get('/api/categories')
            .expect(200);

        expect(categoriesRes.body.success).to.be.true;
        const categories = categoriesRes.body.data;
        expect(categories.length).to.be.greaterThan(0);

        console.log('✅ Step 1: Got', categories.length, 'categories');

        // 2. ดึง buildings
        const buildingsRes = await request(app)
            .get('/api/locations/buildings')
            .expect(200);

        expect(buildingsRes.body.success).to.be.true;
        const buildings = buildingsRes.body.data;
        expect(buildings.length).to.be.greaterThan(0);

        console.log('✅ Step 2: Got', buildings.length, 'buildings');

        // 3. ดึง floors ของ building แรก
        const firstBuilding = buildings[0];
        const floorsRes = await request(app)
            .get(`/api/locations/floors/${firstBuilding}`)
            .expect(200);

        expect(floorsRes.body.success).to.be.true;
        const floors = floorsRes.body.data;
        expect(floors.length).to.be.greaterThan(0);

        console.log('✅ Step 3: Got', floors.length, 'floors for', firstBuilding);

        // 4. ดึง rooms ของ floor แรก
        const firstFloor = floors[0];
        const roomsRes = await request(app)
            .get(`/api/locations/rooms/${firstBuilding}/${firstFloor}`)
            .expect(200);

        expect(roomsRes.body.success).to.be.true;
        const rooms = roomsRes.body.data;

        console.log('✅ Step 4: Got', rooms.length, 'rooms for', firstBuilding, firstFloor);

        console.log('\n✅ Integration test passed!');
        console.log('   Sample data for complaint:');
        console.log('   - Category:', categories[0].name);
        console.log('   - Building:', firstBuilding);
        console.log('   - Floor:', firstFloor);
        console.log('   - Room:', rooms[0] || 'N/A');
    });
});

// สรุปผลการทดสอบ
describe('📊 Summary', function () {
    it('แสดงสรุปข้อมูลในระบบ', async function () {
        const [categoriesRes, buildingsRes] = await Promise.all([
            request(app).get('/api/categories').expect(200),
            request(app).get('/api/locations/buildings').expect(200)
        ]);

        console.log('\n' + '='.repeat(60));
        console.log('📊 SYSTEM DATA SUMMARY');
        console.log('='.repeat(60));
        console.log(`📂 Total Categories: ${categoriesRes.body.data.length}`);
        console.log(`🏢 Total Buildings: ${buildingsRes.body.data.length}`);

        // นับจำนวน locations ทั้งหมด
        let totalLocations = 0;
        for (const building of buildingsRes.body.data) {
            const floorsRes = await request(app)
                .get(`/api/locations/floors/${building}`)
                .expect(200);

            for (const floor of floorsRes.body.data) {
                const roomsRes = await request(app)
                    .get(`/api/locations/rooms/${building}/${floor}`)
                    .expect(200);
                totalLocations += roomsRes.body.data.length;
            }
        }

        console.log(`📍 Total Locations: ${totalLocations}`);
        console.log('='.repeat(60));
        console.log('✅ All APIs are working correctly!');
        console.log('='.repeat(60) + '\n');
    });
});