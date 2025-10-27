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

// ==================== Locations Data ====================
const locations = [
    // อาคาร 1
    { building: 'อาคาร 1', floor: 'ชั้น 1', room: '', description: 'ล็อบบี้' },
    { building: 'อาคาร 1', floor: 'ชั้น 1', room: '101', description: 'ห้องเรียน' },
    { building: 'อาคาร 1', floor: 'ชั้น 1', room: '102', description: 'ห้องเรียน' },
    { building: 'อาคาร 1', floor: 'ชั้น 1', room: '103', description: 'ห้องปฏิบัติการคอมพิวเตอร์' },
    { building: 'อาคาร 1', floor: 'ชั้น 2', room: '201', description: 'ห้องเรียน' },
    { building: 'อาคาร 1', floor: 'ชั้น 2', room: '202', description: 'ห้องเรียน' },
    { building: 'อาคาร 1', floor: 'ชั้น 3', room: '301', description: 'ห้องเรียน' },

    // อาคาร 2
    { building: 'อาคาร 2', floor: 'ชั้น 1', room: '', description: 'ล็อบบี้' },
    { building: 'อาคาร 2', floor: 'ชั้น 1', room: '101', description: 'ห้องเรียน' },
    { building: 'อาคาร 2', floor: 'ชั้น 1', room: 'โรงอาหาร', description: 'โรงอาหาร' },
    { building: 'อาคาร 2', floor: 'ชั้น 2', room: '201', description: 'ห้องเรียน' },
    { building: 'อาคาร 2', floor: 'ชั้น 2', room: '202', description: 'ห้องปฏิบัติการวิทยาศาสตร์' },

    // อาคาร 3 (หอพัก)
    { building: 'อาคาร 3', floor: 'ชั้น 1', room: '', description: 'ล็อบบี้หอพัก' },
    { building: 'อาคาร 3', floor: 'ชั้น 1', room: 'ห้องซักรีด', description: 'ห้องซักรีดรวม' },
    { building: 'อาคาร 3', floor: 'ชั้น 2', room: '201-210', description: 'ห้องพักนักศึกษา' },

    // อาคารกีฬา
    { building: 'อาคารกีฬา', floor: 'ชั้น 1', room: 'สนามบาสเกตบอล', description: 'สนามกีฬา' },
    { building: 'อาคารกีฬา', floor: 'ชั้น 1', room: 'สนามฟุตซอล', description: 'สนามกีฬา' },

    // ห้องสมุด
    { building: 'ห้องสมุด', floor: 'ชั้น 1', room: '', description: 'เคาน์เตอร์ยืม-คืน' },
    { building: 'ห้องสมุด', floor: 'ชั้น 2', room: 'โซนศึกษาค้นคว้า', description: 'โซนอ่านหนังสือ' },

    // พื้นที่กลางแจ้ง
    { building: 'พื้นที่กลางแจ้ง', floor: 'ชั้น 1', room: 'ลานจอดรถ A', description: 'ลานจอดรถ' },
    { building: 'พื้นที่กลางแจ้ง', floor: 'ชั้น 1', room: 'สวนหย่อม', description: 'พื้นที่พักผ่อน' }
];

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