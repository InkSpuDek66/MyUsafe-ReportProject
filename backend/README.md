# Backend

REST API สำหรับระบบรับเรื่องร้องเรียน (Node.js + Express + MongoDB)

## Installation

```bash
cd backend
npm install
```

แพ็กเกจหลักที่ใช้: `express`, `mongoose`, `cors`, `socket.io`, `bcryptjs`, `multer` (อัปโหลดไฟล์)

Testing dependencies:

```bash
npm install -D mocha chai supertest
npm install -D mochawesome   # HTML test reports
```

## Scripts

| คำสั่ง | หน้าที่ |
|--------|---------|
| `npm start` | เริ่ม server |
| `npm run dev` | เริ่ม server ด้วย nodemon |
| `npm run seed` | สร้างข้อมูลเริ่มต้น |
| `npm test` | รันเทสต์ |
| `npm run test:watch` | รันเทสต์แบบ watch |
| `npm run test:report` | รันเทสต์และสร้าง HTML report (`test-reports/`) |

## API Endpoints

### Complaints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/complaints` | ดึงรายการเรื่องร้องเรียนทั้งหมด (มี filter) |
| GET | `/api/complaints/:id` | ดึงเรื่องร้องเรียนเดียว |
| POST | `/api/complaints` | สร้างเรื่องร้องเรียนใหม่ |
| PUT | `/api/complaints/:id` | อัปเดตเรื่องร้องเรียน |
| DELETE | `/api/complaints/:id` | ลบเรื่องร้องเรียน |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations/buildings` | ดึงรายการอาคาร |
| GET | `/api/locations/floors/:building` | ดึงรายการชั้นของอาคาร |
| GET | `/api/locations/rooms/:building/:floor` | ดึงรายการห้อง |
| POST | `/api/locations` | สร้างตำแหน่งใหม่ (Admin) |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | ดึงรายการหมวดหมู่ |
| POST | `/api/categories` | สร้างหมวดหมู่ใหม่ (Admin) |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | อัปโหลดรูปภาพ (สูงสุด 5 รูป) |
