// backend/scripts/seedTestUsers.js
// Script สำหรับสร้าง test users ในระบบ

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

// ==================== User Schema ====================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'staff', 'reporter'],
        default: 'reporter'
    },
    phone: { type: String },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ==================== Test Users Data ====================
const testUsers = [
    // Admin Users
    {
        name: 'ผู้ดูแลระบบหลัก',
        email: 'admin@university.ac.th',
        password: 'Admin123!',
        role: 'admin',
        phone: '081-234-5678'
    },
    {
        name: 'Admin Test',
        email: 'admin.test@university.ac.th',
        password: 'Admin123!',
        role: 'admin',
        phone: '081-234-5679'
    },

    // Staff Users
    {
        name: 'เจ้าหน้าที่งานอาคารสถานที่',
        email: 'staff.building@university.ac.th',
        password: 'Staff123!',
        role: 'staff',
        phone: '082-345-6789'
    },
    {
        name: 'เจ้าหน้าที่งานไฟฟ้า',
        email: 'staff.electrical@university.ac.th',
        password: 'Staff123!',
        role: 'staff',
        phone: '082-345-6790'
    },
    {
        name: 'เจ้าหน้าที่คอมพิวเตอร์',
        email: 'staff.it@university.ac.th',
        password: 'Staff123!',
        role: 'staff',
        phone: '082-345-6791'
    },
    {
        name: 'Staff Test',
        email: 'staff.test@university.ac.th',
        password: 'Staff123!',
        role: 'staff',
        phone: '082-345-6792'
    },

    // Reporter Users (นักศึกษา/บุคลากร)
    {
        name: 'สมชาย ใจดี',
        email: 'somchai@student.university.ac.th',
        password: 'User123!',
        role: 'reporter',
        phone: '083-456-7890'
    },
    {
        name: 'สมหญิง สวยงาม',
        email: 'somying@student.university.ac.th',
        password: 'User123!',
        role: 'reporter',
        phone: '083-456-7891'
    },
    {
        name: 'ทดสอบ ทดสอบ',
        email: 'test@student.university.ac.th',
        password: 'User123!',
        role: 'reporter',
        phone: '083-456-7892'
    },
    {
        name: 'User Test 1',
        email: 'user1@university.ac.th',
        password: 'User123!',
        role: 'reporter',
        phone: '083-456-7893'
    },
    {
        name: 'User Test 2',
        email: 'user2@university.ac.th',
        password: 'User123!',
        role: 'reporter',
        phone: '083-456-7894'
    }
];

// ฟังก์ชันเชื่อมต่อ MongoDB
const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGO_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
        console.log(`🔍 Database: ${mongoose.connection.name}\n`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// ฟังก์ชัน hash password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// ฟังก์ชันเพิ่ม Test Users
const seedTestUsers = async () => {
    try {
        console.log('🌱 Seeding Test Users...\n');

        // ลบ users เก่าออก (ถ้ามี)
        const existingCount = await User.countDocuments();
        if (existingCount > 0) {
            console.log(`   ⚠️  Clearing ${existingCount} existing users...`);
            await User.deleteMany({});
        }

        // สร้าง users ใหม่พร้อม hash password
        const usersToInsert = [];

        for (const user of testUsers) {
            const hashedPassword = await hashPassword(user.password);
            usersToInsert.push({
                ...user,
                password: hashedPassword
            });
        }

        const result = await User.insertMany(usersToInsert);
        console.log(`   ✅ Added ${result.length} test users\n`);

        return result;
    } catch (error) {
        console.error('   ❌ Error seeding test users:', error.message);
        throw error;
    }
};

// ฟังก์ชันแสดงสรุป
const showSummary = async () => {
    try {
        console.log('='.repeat(70));
        console.log('👥 TEST USERS SUMMARY');
        console.log('='.repeat(70) + '\n');

        // แสดงผู้ใช้แยกตาม role
        const roles = ['admin', 'staff', 'reporter'];

        for (const role of roles) {
            const users = await User.find({ role }).select('name email role phone');

            const roleEmoji = {
                'admin': '👑',
                'staff': '👷',
                'reporter': '👤'
            };

            const roleLabel = {
                'admin': 'ADMINS',
                'staff': 'STAFF',
                'reporter': 'REPORTERS (Students/Personnel)'
            };

            console.log(`${roleEmoji[role]} ${roleLabel[role]} (${users.length}):`);
            console.log('-'.repeat(70));

            users.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.name}`);
                console.log(`      📧 Email: ${user.email}`);
                console.log(`      📱 Phone: ${user.phone || 'N/A'}`);
                console.log(`      🔑 Password: ${testUsers.find(u => u.email === user.email)?.password || 'N/A'}`);
                console.log('');
            });
        }

        const totalUsers = await User.countDocuments();
        console.log('='.repeat(70));
        console.log(`📊 Total Users: ${totalUsers}`);
        console.log('='.repeat(70) + '\n');

        console.log('💡 LOGIN CREDENTIALS:\n');
        console.log('Admin:');
        console.log('  Email: admin@university.ac.th');
        console.log('  Password: Admin123!\n');

        console.log('Staff:');
        console.log('  Email: staff.it@university.ac.th');
        console.log('  Password: Staff123!\n');

        console.log('Reporter (Student):');
        console.log('  Email: test@student.university.ac.th');
        console.log('  Password: User123!\n');

        console.log('='.repeat(70));
        console.log('🎉 Test users created successfully!');
        console.log('='.repeat(70) + '\n');

    } catch (error) {
        console.error('❌ Error showing summary:', error);
    }
};

// ฟังก์ชันหลัก
const main = async () => {
    try {
        console.log('\n🚀 Starting test users seed process...\n');

        await connectDB();
        await seedTestUsers();
        await showSummary();

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// รันสคริปต์
main();