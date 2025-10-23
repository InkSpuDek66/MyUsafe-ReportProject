// backend/src/scripts/seedLargeData.js
// สคริปต์สำหรับเพิ่มข้อมูล Dummy จำนวนมาก: 200 Complaints และ 50 Comments
// ========================================================
// ### วิธีรัน Seed Script
// node src/scripts/seedLargeData.js
// ========================================================
const mongoose = require('mongoose');
const Complaint = require('../models/homeModel');
const Comment = require('../models/commentModel');

// ฟังก์ชันสร้าง complaint_id แบบ random
function generateComplaintId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CMP-${timestamp}-${random}`.toUpperCase();
}

// ฟังก์ชันสุ่มวันที่ย้อนหลัง (0-90 วัน)
function getRandomDate(daysBack = 90) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date;
}

// ฟังก์ชันสุ่มเลือกจาก array
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ฟังก์ชันสุ่มเลือกหลายรายการจาก array
function randomChoices(arr, min = 1, max = 3) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
}

async function seedLargeData() {
    try {
        // เชื่อมต่อ MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/MyUSafe_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🟢 Connected to MongoDB');

        // ลบข้อมูลเก่า
        await Complaint.deleteMany({});
        await Comment.deleteMany({});
        console.log('🗑️  Cleared old data');

        // ========== ข้อมูลสำหรับสร้าง Complaints ==========
        const buildings = [
            'อาคาร 1', 'อาคาร 2', 'อาคาร 3', 'อาคาร 4', 'อาคาร 5',
            'อาคาร 6', 'อาคาร 7', 'อาคาร 8', 'อาคาร 9', 'อาคาร 10',
            'อาคารเรียนรวม', 'อาคารปฏิบัติการ', 'หอพักนักศึกษา', 'อาคารสำนักงาน'
        ];

        const floors = ['ชั้น 1', 'ชั้น 2', 'ชั้น 3', 'ชั้น 4', 'ชั้น 5', 'ชั้น 6'];

        const roomPrefixes = ['101', '102', '103', '201', '202', '203', '301', '302', '303', 
                             'โถงทางเดิน', 'ห้องน้ำชาย', 'ห้องน้ำหญิง', 'ห้องประชุม', 'ลิฟต์'];

        const categories = ['flood', 'electrical', 'computer', 'plumbing', 'facilities', 'cleanliness', 'safety', 'other'];

        const priorities = ['low', 'medium', 'high', 'urgent'];

        const statuses = ['รอรับเรื่อง', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'];

        // หัวข้อเรื่องร้องเรียนแบบละเอียด (100+ รายการ)
        const complaintTitles = [
            // น้ำท่วม/ระบายน้ำ
            'น้ำท่วมบริเวณโถงทางเดิน', 'ท่อน้ำแตกในห้องน้ำ', 'น้ำรั่วจากเพดาน',
            'ท่อระบายน้ำอุดตัน', 'น้ำท่วมหน้าห้องเรียน', 'ท่อน้ำประปาแตก',
            'ห้องน้ำน้ำไหลล้นออกมา', 'น้ำรั่วจากแอร์', 'ท่อน้ำทิ้งแตก',
            'น้ำขังบริเวณลานจอดรถ', 'รางน้ำฝนอุดตัน', 'น้ำเซาะพื้น',
            
            // ไฟฟ้า/แอร์
            'ไฟฟ้าดับบ่อย', 'หลอดไฟในห้องเรียนไม่ติด', 'เครื่องปรับอากาศไม่เย็น',
            'แอร์มีกลิ่นเหม็น', 'ปลั๊กไฟใช้ไม่ได้', 'สวิตช์ไฟเสีย',
            'ไฟกระพริบ', 'แอร์ร่วงน้ำ', 'พัดลมเพดานไม่หมุน',
            'โคมไฟชำรุด', 'ไฟฉุกเฉินไม่ติด', 'ปลั๊กไฟลัดวงจร',
            'แอร์มีเสียงดังผิดปกติ', 'ไฟในทางเดินมืด', 'สายไฟชำรุด',
            
            // คอมพิวเตอร์/เน็ต
            'อินเทอร์เน็ตช้ามาก', 'คอมพิวเตอร์ในห้องปฏิบัติการเสีย',
            'WiFi สัญญาณไม่เข้า', 'เครื่องพิมพ์ไม่ทำงาน', 'โปรเจคเตอร์เสีย',
            'จอคอมพิวเตอร์แตก', 'คีย์บอร์ดเสีย', 'เมาส์ไม่ทำงาน',
            'เว็บไซต์ล่ม', 'ระบบ Login ไม่ได้', 'อุปกรณ์ AV ชำรุด',
            'ลำโพงไม่มีเสียง', 'ไมโครโฟนเสีย', 'กล้อง CCTV เสีย',
            
            // ประปา/สุขภัณฑ์
            'ก้อนน้ำในห้องน้ำไม่ไหล', 'ชักโครกอุดตัน', 'ก๊อกน้ำแตก',
            'ก๊อกน้ำหยดตลอดเวลา', 'ฝักบัวเสีย', 'อ่างล้างมือแตก',
            'ท่อน้ำทิ้งอุดตัน', 'น้ำไม่ไหล', 'ความดันน้ำต่ำ',
            'น้ำมีกลิ่นเหม็น', 'ที่ล้างจานแตก', 'ฝาชักโครกหัก',
            
            // อาคารสถานที่
            'ประตูห้องเรียนเสีย', 'หน้าต่างแตก', 'กระจกแตก',
            'โต๊ะเก้าอี้ชำรุด', 'กุญแจห้องหาย', 'ลูกบิดประตูหลุด',
            'ฝ้าเพดานร่วง', 'พื้นผิวไม่เรียบ', 'รั้วชำรุด',
            'ขั้นบันไดหัก', 'ราวบันไดหลุด', 'หลังคารั่ว',
            'ผนังร้าว', 'กระเบื้องแตก', 'ประตูงานยาก',
            
            // ความสะอาด
            'ห้องน้ำสกปรก', 'ถังขยะเต็ม', 'มีกลิ่นเหม็น',
            'พื้นห้องเรียนสกปรก', 'แมลงสาบเยอะ', 'มดรังรบ',
            'หนูวิ่งเข้ามาในห้อง', 'ฝุ่นเยอะ', 'เว็บแมงมุมเต็มฝ้า',
            'กระดาษชำระหมด', 'สบู่หมด', 'น้ำยาทำความสะอาดหมด',
            
            // ความปลอดภัย
            'ลิฟต์ขัดข้อง', 'ประตูฉุกเฉินล็อค', 'ไฟทางหนีไฟไม่ติด',
            'เครื่องดับเพลิงหมดอายุ', 'แผ่นป้ายหลุด', 'พื้นลื่น',
            'บันไดไม่มีราว', 'ช่องระบายอากาศอุดตัน', 'สัญญาณเตือนไฟไหม้เสีย',
            'กล้องวงจรปิดไม่ทำงาน', 'รั้วโล่ง', 'ประตูล็อคอัตโนมัติเสีย',
            
            // อื่นๆ
            'เสียงดังรบกวนจากห้องติดกัน', 'กล่องจดหมายเต็ม',
            'ตู้น้ำดื่มเสีย', 'ที่จอดรถไม่พอ', 'ป้ายบอกทางหาย',
            'ระบบเสียงห้องประชุมเสีย', 'เครื่องถ่ายเอกสารเสีย',
            'ตู้ล็อคเกอร์เสีย', 'ม้านั่งในสวนชำรุด', 'ไฟสนามกีฬาไม่ติด'
        ];

        // คำอธิบายแบบละเอียด
        const descriptionTemplates = [
            'พบปัญหา{problem}ที่{location} เมื่อวันที่ {date} ส่งผลกระทบต่อการใช้งาน กรุณาดำเนินการแก้ไขโดยเร็ว',
            'แจ้งปัญหา{problem} บริเวณ{location} พบเมื่อเวลา {time} มีผู้ใช้งานได้รับความไม่สะดวก',
            'ตรวจพบ{problem}ที่{location} อาการคือ {symptom} ต้องการให้ช่างมาตรวจสอบ',
            '{problem}ที่{location} เกิดขึ้นบ่อยครั้ง ควรแก้ไขอย่างถาวร',
            'เรื่อง{problem}ที่{location} ทำให้{impact} กรุณาเร่งดำเนินการ',
            'พบว่า{problem}บริเวณ{location} ส่งผลกระทบต่อ{impact}',
            '{problem}ที่{location} เกิดจาก{cause} ควรได้รับการแก้ไขโดยเร็ว',
            'มีปัญหา{problem}ที่{location} อยากให้ช่างมาดูด่วน เพราะ{reason}'
        ];

        const symptoms = [
            'มีเสียงดังผิดปกติ', 'มีกลิ่นเหม็น', 'ไม่ทำงาน', 'ชำรุดเสียหาย',
            'รั่วซึม', 'แตกร้าว', 'หลวม', 'สกปรก'
        ];

        const impacts = [
            'นักศึกษาและบุคลากร', 'การเรียนการสอน', 'ความปลอดภัย',
            'สุขอนามัย', 'ภาพลักษณ์ของสถาบัน', 'การใช้งานอาคาร'
        ];

        const causes = [
            'การใช้งานมานาน', 'ขาดการบำรุงรักษา', 'อุบัติเหตุ',
            'ภัยธรรมชาติ', 'การใช้งานที่ไม่ถูกต้อง'
        ];

        const reasons = [
            'ส่งผลกระทบต่อการเรียนการสอน', 'อาจเกิดอันตรายได้',
            'ก่อให้เกิดความไม่สะดวก', 'ทำให้ไม่สามารถใช้งานได้'
        ];

        // ========== สร้าง 200 Complaints ==========
        console.log('📝 Creating 200 complaints...');
        const complaints = [];
        
        for (let i = 0; i < 200; i++) {
            const complaintId = generateComplaintId();
            const reportedDate = getRandomDate(90);
            const status = randomChoice(statuses);
            const priority = randomChoice(priorities);
            const building = randomChoice(buildings);
            const floor = randomChoice(floors);
            const room = randomChoice(roomPrefixes);
            
            // สุ่มหมวดหมู่ 1-3 หมวดหมู่
            const selectedCategories = randomChoices(categories, 1, 3);

            // สร้าง description แบบสุ่ม
            const template = randomChoice(descriptionTemplates);
            const description = template
                .replace('{problem}', randomChoice(complaintTitles))
                .replace('{location}', `${building} ${floor} ${room}`)
                .replace('{date}', reportedDate.toLocaleDateString('th-TH'))
                .replace('{time}', `${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 60)} น.`)
                .replace('{symptom}', randomChoice(symptoms))
                .replace('{impact}', randomChoice(impacts))
                .replace('{cause}', randomChoice(causes))
                .replace('{reason}', randomChoice(reasons));

            // สร้าง status_history
            const statusHistory = [{
                status_id: '1',
                status_name: 'รอรับเรื่อง',
                updated_at: reportedDate,
                updated_by: 'system'
            }];

            // เพิ่ม history ตามสถานะ
            if (status !== 'รอรับเรื่อง') {
                statusHistory.push({
                    status_id: '2',
                    status_name: 'กำลังดำเนินการ',
                    updated_at: new Date(reportedDate.getTime() + Math.random() * 86400000 * 2),
                    updated_by: `STAFF${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`
                });
            }

            if (status === 'เสร็จสิ้น' || status === 'ยกเลิก') {
                statusHistory.push({
                    status_id: status === 'เสร็จสิ้น' ? '3' : '4',
                    status_name: status,
                    updated_at: new Date(reportedDate.getTime() + Math.random() * 86400000 * 7),
                    updated_by: `STAFF${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`
                });
            }

            const complaint = {
                complaint_id: complaintId,
                title: complaintTitles[i % complaintTitles.length] + (i >= complaintTitles.length ? ` (${Math.floor(i / complaintTitles.length) + 1})` : ''),
                categories: selectedCategories,
                description: description,
                datetime_reported: reportedDate,
                attachments: [],
                user_id: `USER${String(Math.floor(Math.random() * 500) + 1).padStart(4, '0')}`,
                assigned_to: status === 'รอรับเรื่อง' ? null : `STAFF${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`,
                assigned_at: status === 'รอรับเรื่อง' ? null : new Date(reportedDate.getTime() + 3600000),
                assigned_by: status === 'รอรับเรื่อง' ? null : 'ADMIN001',
                location: {
                    building: building,
                    floor: floor,
                    room: room
                },
                priority: priority,
                current_status: status,
                status_history: statusHistory,
                likes: Math.floor(Math.random() * 100),
                dislikes: Math.floor(Math.random() * 20),
                views: Math.floor(Math.random() * 500) + 50,
                time_used: status === 'เสร็จสิ้น' ? `${Math.floor(Math.random() * 96) + 1} ชั่วโมง` : '-',
                completed_date: status === 'เสร็จสิ้น' ? new Date(reportedDate.getTime() + 86400000 * Math.random() * 14).toISOString() : '-'
            };

            complaints.push(complaint);

            // แสดง progress ทุก 50 รายการ
            if ((i + 1) % 50 === 0) {
                console.log(`   ✓ Created ${i + 1}/200 complaints`);
            }
        }

        const insertedComplaints = await Complaint.insertMany(complaints);
        console.log(`✅ Total complaints created: ${insertedComplaints.length}`);

        // ========== สร้าง 50 Comments ==========
        console.log('\n💬 Creating 50 comments...');
        
        const commentTexts = [
            // Staff comments
            'ได้รับเรื่องแล้วครับ กำลังดำเนินการตรวจสอบ คาดว่าจะแล้วเสร็จภายใน 2-3 วัน',
            'ขอบคุณสำหรับการแจ้ง ทีมงานจะไปตรวจสอบในวันพรุ่งนี้',
            'ช่างได้ไปตรวจสอบเบื้องต้นแล้ว พบว่าต้องสั่งอะไหล่เพิ่ม',
            'กำลังประสานงานกับแผนกที่เกี่ยวข้อง จะแจ้งความคืบหน้าอีกครั้ง',
            'ปัญหานี้ต้องใช้เวลาในการแก้ไขประมาณ 1 สัปดาห์',
            'ได้ดำเนินการแก้ไขเรียบร้อยแล้วครับ กรุณาตรวจสอบ',
            'ต้องการข้อมูลเพิ่มเติม กรุณาระบุเวลาที่พบปัญหา',
            'ได้ส่งช่างไปดำเนินการแก้ไขแล้ว',
            'ขออภัยในความไม่สะดวก กำลังเร่งดำเนินการ',
            'ปัญหาได้รับการแก้ไขแล้ว ขอบคุณที่แจ้ง',
            
            // Admin comments  
            'ได้มอบหมายงานให้เจ้าหน้าที่แล้ว จะติดตามความคืบหน้า',
            'เรื่องนี้เร่งด่วน ได้สั่งการให้ดำเนินการทันที',
            'กำลังจัดหางบประมาณในการแก้ไข',
            'ได้บันทึกเรื่องนี้ไว้ในแผนบำรุงรักษาประจำเดือน',
            'ขอบคุณที่แจ้งเตือน จะดำเนินการแก้ไขโดยเร็ว',
            
            // Reporter comments
            'ขอบคุณที่รับเรื่อง รอติดตามความคืบหน้าครับ',
            'ปัญหายังไม่ได้รับการแก้ไขค่ะ',
            'ขอบคุณมากครับ แก้ไขได้ดีมาก',
            'ตอนนี้ใช้งานได้ปกติแล้ว ขอบคุณค่ะ',
            'ปัญหาเกิดขึ้นอีกครั้ง กรุณาตรวจสอบใหม่',
            'ขอทราบความคืบหน้าครับ',
            'เมื่อไหร่จะสามารถแก้ไขได้คะ',
            'อยากให้เร่งดำเนินการด้วยครับ',
            'ขอบคุณที่ดูแลครับ',
            'ตอนนี้ดีขึ้นมากแล้วค่ะ'
        ];

        const userRoles = ['admin', 'staff', 'reporter'];
        const comments = [];

        for (let i = 0; i < 50; i++) {
            const randomComplaint = insertedComplaints[Math.floor(Math.random() * insertedComplaints.length)];
            const role = randomChoice(userRoles);
            
            let userId, userName;
            if (role === 'admin') {
                userId = 'ADMIN001';
                userName = 'ผู้ดูแลระบบ';
            } else if (role === 'staff') {
                const staffNum = Math.floor(Math.random() * 20) + 1;
                userId = `STAFF${String(staffNum).padStart(3, '0')}`;
                userName = `เจ้าหน้าที่ ${staffNum}`;
            } else {
                const userNum = Math.floor(Math.random() * 500) + 1;
                userId = `USER${String(userNum).padStart(4, '0')}`;
                userName = `ผู้ใช้ ${userNum}`;
            }

            const commentDate = new Date(
                randomComplaint.datetime_reported.getTime() + 
                Math.random() * 86400000 * 10
            );

            const comment = {
                complaint_id: randomComplaint.complaint_id,
                user_id: userId,
                user_name: userName,
                user_role: role,
                comment: randomChoice(commentTexts),
                images: [],
                created_at: commentDate,
                is_edited: Math.random() > 0.9
            };

            comments.push(comment);

            // แสดง progress ทุก 10 รายการ
            if ((i + 1) % 10 === 0) {
                console.log(`   ✓ Created ${i + 1}/50 comments`);
            }
        }

        const insertedComments = await Comment.insertMany(comments);
        console.log(`✅ Total comments created: ${insertedComments.length}`);

        // ========== สรุปผลลัพธ์ ==========
        console.log('\n🎉 ========== SEED COMPLETED ==========');
        console.log(`📊 Summary:`);
        console.log(`   • Complaints: ${insertedComplaints.length}`);
        console.log(`   • Comments: ${insertedComments.length}`);
        
        // สถิติเพิ่มเติม
        const statusCounts = {};
        const categoryCounts = {};
        const priorityCounts = {};
        
        insertedComplaints.forEach(c => {
            statusCounts[c.current_status] = (statusCounts[c.current_status] || 0) + 1;
            priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;
            c.categories.forEach(cat => {
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
        });

        console.log(`\n📈 Status Distribution:`);
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   • ${status}: ${count}`);
        });

        console.log(`\n🎯 Priority Distribution:`);
        Object.entries(priorityCounts).forEach(([priority, count]) => {
            console.log(`   • ${priority}: ${count}`);
        });

        console.log(`\n🏷️  Top 5 Categories:`);
        Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([cat, count]) => {
                console.log(`   • ${cat}: ${count}`);
            });

        console.log('\n✨ =====================================');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
}

seedLargeData();