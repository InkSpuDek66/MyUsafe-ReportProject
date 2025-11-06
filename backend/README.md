cd backend
npm install express mongoose cors socket.io bcryptjs
npm install multer  # สำหรับ upload ไฟล์

## 📦 ติดตั้ง Testing Dependencies
npm install --save-dev chai mocha mochawesome

passport - ไลบรารีสำหรับ Authentication
passport-google-oauth20 - Strategy สำหรับ Google
<!-- passport-github2 - Strategy สำหรับ GitHub -->
express-session - จัดการ Session
cookie-parser - จัดการ Cookies

รัน npm run seed เพื่อสร้างข้อมูลเริ่มต้น
รัน npm start เพื่อเริ่ม server

## 📚 API Endpoint Summary

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/complaints | ดึงรายการเรื่องร้องเรียนทั้งหมด (มี filter) |
| GET | /api/complaints/:id | ดึงเรื่องร้องเรียนเดียว |
| POST | /api/complaints | สร้างเรื่องร้องเรียนใหม่ |
| PUT | /api/complaints/:id | อัพเดทเรื่องร้องเรียน |
| DELETE | /api/complaints/:id | ลบเรื่องร้องเรียน |

### Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/locations/buildings | ดึงรายการอาคาร |
| GET | /api/locations/floors/:building | ดึงรายการชั้นของอาคาร |
| GET | /api/locations/rooms/:building/:floor | ดึงรายการห้อง |
| POST | /api/locations | สร้างตำแหน่งใหม่ (Admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | ดึงรายการหมวดหมู่ |
| POST | /api/categories | สร้างหมวดหมู่ใหม่ (Admin) |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload | อัพโหลดรูปภาพ (สูงสุด 5 รูป) |