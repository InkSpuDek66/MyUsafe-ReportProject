// backend/src/scripts/seedData.js
// สคริปต์สำหรับเพิ่มข้อมูลเริ่มต้น (seed data) ลงในฐานข้อมูล MongoDB
// ========================================================
// ### วิธีรัน Seed Script
// node src/scripts/seedData.js
// ========================================================
const mongoose = require('mongoose');
const Location = require('../models/locationModel');
const Category = require('../models/categoryModel');

async function seedDatabase() {
    try {
        // เชื่อมต่อ MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/MyUSafe_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🟢 Connected to MongoDB');

        // ลบข้อมูลเก่า (ถ้ามี)
        await Location.deleteMany({});
        await Category.deleteMany({});
        console.log('🗑️  Cleared old data');

        // สร้างข้อมูล Locations
        const locations = [
            // อาคาร 1
            { building: 'อาคาร 1', floor: '1', room: '101' },
            { building: 'อาคาร 1', floor: '1', room: '102' },
            { building: 'อาคาร 1', floor: '2', room: '201' },
            { building: 'อาคาร 1', floor: '2', room: '202' },
            { building: 'อาคาร 1', floor: '3', room: '301' },
            { building: 'อาคาร 1', floor: '4', room: '401' },

            // อาคาร 2
            { building: 'อาคาร 2', floor: '1', room: '101' },
            { building: 'อาคาร 2', floor: '2', room: '201' },
            { building: 'อาคาร 2', floor: '3', room: '301' },

            // อาคารเรียนรวม
            { building: 'อาคารเรียนรวม', floor: '1', room: 'ห้องประชุม A' },
            { building: 'อาคารเรียนรวม', floor: '2', room: 'ห้องคอมพิวเตอร์' },
            { building: 'อาคารเรียนรวม', floor: '3', room: 'ห้องสมุด' },

            // หอพัก
            { building: 'หอพักนักศึกษา', floor: '1', room: '101' },
            { building: 'หอพักนักศึกษา', floor: '2', room: '201' },
            { building: 'หอพักนักศึกษา', floor: '3', room: '301' },
        ];

        await Location.insertMany(locations);
        console.log('✅ Locations created:', locations.length);

        // สร้างข้อมูล Categories
        const categories = [
            {
                name: 'น้ำท่วม',
                description: 'ปัญหาเกี่ยวกับน้ำท่วม น้ำรั่ว ท่อแตก'
            },
            {
                name: 'ไฟฟ้า',
                description: 'ปัญหาไฟฟ้า เครื่องปรับอากาศ หลอดไฟ'
            },
            {
                name: 'คอมพิวเตอร์/เว็บไซต์',
                description: 'ปัญหาคอมพิวเตอร์ อินเทอร์เน็ต เว็บไซต์'
            },
            {
                name: 'ทั่วไป',
                description: 'ปัญหาทั่วไปอื่นๆ'
            },
            {
                name: 'อื่นๆ',
                description: 'ปัญหาอื่นๆ ที่ไม่อยู่ในหมวดหมู่'
            }
        ];

        await Category.insertMany(categories);
        console.log('✅ Categories created:', categories.length);

        console.log('🎉 Seed data completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
}

seedDatabase();