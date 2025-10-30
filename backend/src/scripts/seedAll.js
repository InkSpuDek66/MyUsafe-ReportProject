// backend/scripts/seedAll.js
// สคริปต์สำหรับเพิ่มข้อมูลทั้งหมด (Categories + Locations)

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

// ==================== Category Schema ====================
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String },
    auto_assign_dept: { type: String },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// ==================== Location Schema ====================
const locationSchema = new mongoose.Schema({
    building: { type: String, required: true },
    floor: { type: String, required: true },
    room: { type: String },
    description: { type: String },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);

// ==================== Categories Data ====================
const categories = [
    { name: 'น้ำท่วม', description: 'ปัญหาเกี่ยวกับน้ำท่วมในอาคาร ท่อระบายน้ำอุดตัน', icon: '💧', auto_assign_dept: 'งานอาคารสถานที่' },
    { name: 'ไฟฟ้า', description: 'ปัญหาเกี่ยวกับระบบไฟฟ้า ไฟฟ้าดับ สวิตช์เสีย หลอดไฟขาด', icon: '⚡', auto_assign_dept: 'งานไฟฟ้า' },
    { name: 'คอมพิวเตอร์/เว็บไซต์', description: 'ปัญหาเกี่ยวกับคอมพิวเตอร์ ระบบเครือข่าย อินเทอร์เน็ต เว็บไซต์', icon: '💻', auto_assign_dept: 'ศูนย์คอมพิวเตอร์' },
    { name: 'ประปา/ท่อน้ำ', description: 'ปัญหาเกี่ยวกับระบบประปา ท่อน้ำรั่ว น้ำไม่ไหล ห้องน้ำอุดตัน', icon: '🚰', auto_assign_dept: 'งานประปา' },
    { name: 'สิ่งอำนวยความสะดวก', description: 'ปัญหาเกี่ยวกับสิ่งอำนวยความสะดวก เช่น ลิฟท์ เครื่องปรับอากาศ โต๊ะ เก้าอี้', icon: '🏢', auto_assign_dept: 'งานอาคารสถานที่' },
    { name: 'ความสะอาด', description: 'ปัญหาเกี่ยวกับความสะอาด ขยะล้นถัง ห้องสกปรก', icon: '🧹', auto_assign_dept: 'งานทำความสะอาด' },
    { name: 'ความปลอดภัย', description: 'ปัญหาเกี่ยวกับความปลอดภัย ประตูเสีย กุญแจหาย CCTV เสีย', icon: '🚨', auto_assign_dept: 'งานรักษาความปลอดภัย' },
    { name: 'อื่นๆ', description: 'ปัญหาอื่นๆ ที่ไม่อยู่ในหมวดหมู่ข้างต้น', icon: '📝', auto_assign_dept: 'งานทั่วไป' }
];

// ==================== ฟังก์ชันสร้าง Locations Data ====================
const generateLocations = () => {
    const locations = [];

    // กำหนดรายการอาคาร
    const buildings = [
        'อาคาร 1', 'อาคาร 2', 'อาคาร 3', 'อาคาร 4',
        'อาคาร 5', 'อาคาร 6', 'อาคาร 7', 'อาคาร 8',
        'อาคาร 9', 'อาคาร 10', 'อาคาร 11', 'อาคาร 12'
    ];

    // กำหนดรายการชั้น
    const floors = [
        'ชั้น 1', 'ชั้น 2', 'ชั้น 3', 'ชั้น 4',
        'ชั้น 5', 'ชั้น 6', 'ชั้น 7', 'ชั้น 8',
        'ชั้น 9', 'ชั้น 10', 'ชั้น 11', 'ชั้น 12',
        'ชั้น 13', 'ชั้น 14', 'ชั้น 15', 'ชั้น 16'
    ];

    // กำหนดรายการห้องตามชั้น
    const roomsByFloor = {
        'ชั้น 1': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: 'ลิฟต์', description: 'ลิฟต์' }
        ],
        'ชั้น 2': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '201', description: 'ห้องเรียน' },
            { room: '202', description: 'ห้องเรียน' },
            { room: '203', description: 'ห้องเรียน' },
            { room: '204', description: 'ห้องเรียน' },
            { room: '205', description: 'ห้องเรียน' }
        ],
        'ชั้น 3': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '301', description: 'ห้องเรียน' },
            { room: '302', description: 'ห้องเรียน' },
            { room: '303', description: 'ห้องเรียน' },
            { room: '304', description: 'ห้องเรียน' },
            { room: '305', description: 'ห้องเรียน' }
        ],
        'ชั้น 4': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '401', description: 'ห้องเรียน' },
            { room: '402', description: 'ห้องเรียน' },
            { room: '403', description: 'ห้องเรียน' },
            { room: '404', description: 'ห้องเรียน' },
            { room: '405', description: 'ห้องเรียน' }
        ],
        'ชั้น 5': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '501', description: 'ห้องเรียน' },
            { room: '502', description: 'ห้องเรียน' },
            { room: '503', description: 'ห้องเรียน' },
            { room: '504', description: 'ห้องเรียน' },
            { room: '505', description: 'ห้องเรียน' }
        ],
        'ชั้น 6': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '601', description: 'ห้องเรียน' },
            { room: '602', description: 'ห้องเรียน' },
            { room: '603', description: 'ห้องเรียน' },
            { room: '604', description: 'ห้องเรียน' },
            { room: '605', description: 'ห้องเรียน' }
        ],
        'ชั้น 7': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '701', description: 'ห้องเรียน' },
            { room: '702', description: 'ห้องเรียน' },
            { room: '703', description: 'ห้องเรียน' },
            { room: '704', description: 'ห้องเรียน' },
            { room: '705', description: 'ห้องเรียน' }
        ],
        'ชั้น 8': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '801', description: 'ห้องเรียน' },
            { room: '802', description: 'ห้องเรียน' },
            { room: '803', description: 'ห้องเรียน' },
            { room: '804', description: 'ห้องเรียน' },
            { room: '805', description: 'ห้องเรียน' }
        ],
        'ชั้น 9': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '901', description: 'ห้องเรียน' },
            { room: '902', description: 'ห้องเรียน' },
            { room: '903', description: 'ห้องเรียน' },
            { room: '904', description: 'ห้องเรียน' },
            { room: '905', description: 'ห้องเรียน' }
        ],
        'ชั้น 10': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '1001', description: 'ห้องเรียน' },
            { room: '1002', description: 'ห้องเรียน' },
            { room: '1003', description: 'ห้องเรียน' },
            { room: '1004', description: 'ห้องเรียน' },
            { room: '1005', description: 'ห้องเรียน' }
        ],
        'ชั้น 11': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '1101', description: 'ห้องเรียน' },
            { room: '1102', description: 'ห้องเรียน' },
            { room: '1103', description: 'ห้องเรียน' },
            { room: '1104', description: 'ห้องเรียน' },
            { room: '1105', description: 'ห้องเรียน' }
        ],
        'ชั้น 12': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '1201', description: 'ห้องเรียน' },
            { room: '1202', description: 'ห้องเรียน' },
            { room: '1203', description: 'ห้องเรียน' },
            { room: '1204', description: 'ห้องเรียน' },
            { room: '1205', description: 'ห้องเรียน' }
        ],
        'ชั้น 13': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '1301', description: 'ห้องเรียน' },
            { room: '1302', description: 'ห้องเรียน' },
            { room: '1303', description: 'ห้องเรียน' },
            { room: '1304', description: 'ห้องเรียน' },
            { room: '1305', description: 'ห้องเรียน' }
        ],
        'ชั้น 14': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '1401', description: 'ห้องเรียน' },
            { room: '1402', description: 'ห้องเรียน' },
            { room: '1403', description: 'ห้องเรียน' },
            { room: '1404', description: 'ห้องเรียน' },
            { room: '1405', description: 'ห้องเรียน' }
        ],
        'ชั้น 15': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '1501', description: 'ห้องเรียน' },
            { room: '1502', description: 'ห้องเรียน' },
            { room: '1503', description: 'ห้องเรียน' },
            { room: '1504', description: 'ห้องเรียน' },
            { room: '1505', description: 'ห้องเรียน' }
        ],
        'ชั้น 16': [
            { room: 'โถงทางเดิน', description: 'โถงทางเดิน' },
            { room: 'ห้องประชุม', description: 'ห้องประชุม' },
            { room: 'ห้องน้ำชาย', description: 'ห้องน้ำชาย' },
            { room: 'ห้องน้ำหญิง', description: 'ห้องน้ำหญิง' },
            { room: '1601', description: 'ห้องเรียน' },
            { room: '1602', description: 'ห้องเรียน' },
            { room: '1603', description: 'ห้องเรียน' },
            { room: '1604', description: 'ห้องเรียน' },
            { room: '1605', description: 'ห้องเรียน' }
        ]
    };

    // สร้างข้อมูล locations สำหรับทุกอาคารและทุกชั้น
    for (const building of buildings) {
        for (const floor of floors) {
            const rooms = roomsByFloor[floor];

            // เพิ่มห้องต่างๆ ในแต่ละชั้น
            for (const roomData of rooms) {
                locations.push({
                    building: building,
                    floor: floor,
                    room: roomData.room,
                    description: roomData.description
                });
            }
        }
    }

    return locations;
};

// สร้าง locations data
const locations = generateLocations();

// ฟังก์ชันเชื่อมต่อ MongoDB
const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGO_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
        console.log(`📍 Database: ${mongoose.connection.name}\n`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// ฟังก์ชันเพิ่ม Categories
const seedCategories = async () => {
    try {
        console.log('🌱 Seeding Categories...');

        const existingCount = await Category.countDocuments();
        if (existingCount > 0) {
            console.log(`   ⚠️  Clearing ${existingCount} existing categories...`);
            await Category.deleteMany({});
        }

        const result = await Category.insertMany(categories);
        console.log(`   ✅ Added ${result.length} categories\n`);

        return result;
    } catch (error) {
        console.error('   ❌ Error seeding categories:', error.message);
        throw error;
    }
};

// ฟังก์ชันเพิ่ม Locations
const seedLocations = async () => {
    try {
        console.log('🌱 Seeding Locations...');

        const existingCount = await Location.countDocuments();
        if (existingCount > 0) {
            console.log(`   ⚠️  Clearing ${existingCount} existing locations...`);
            await Location.deleteMany({});
        }

        const result = await Location.insertMany(locations);
        console.log(`   ✅ Added ${result.length} locations\n`);

        return result;
    } catch (error) {
        console.error('   ❌ Error seeding locations:', error.message);
        throw error;
    }
};

// ฟังก์ชันแสดงสรุป
const showSummary = async () => {
    try {
        console.log('='.repeat(60));
        console.log('📊 DATABASE SUMMARY');
        console.log('='.repeat(60) + '\n');

        // Categories Summary
        const allCategories = await Category.find();
        console.log(`📂 Categories (${allCategories.length}):`);
        allCategories.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.icon} ${cat.name}`);
        });

        console.log('');

        // Locations Summary
        const buildings = await Location.distinct('building');
        const totalLocations = await Location.countDocuments();
        console.log(`📍 Locations (${totalLocations} total, ${buildings.length} buildings):`);

        for (const building of buildings) {
            const count = await Location.countDocuments({ building });
            console.log(`   🏢 ${building}: ${count} locations`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 All data seeded successfully!');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error showing summary:', error);
    }
};

// ฟังก์ชันหลัก
const main = async () => {
    try {
        console.log('\n🚀 Starting seed process...\n');

        await connectDB();

        await seedCategories();
        await seedLocations();

        await showSummary();

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// รันสคริปต์
main();