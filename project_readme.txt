# ระบบรับเรื่องร้องเรียนด้านสถานที่ในสถาบันอุดมศึกษา
## Complaint System for Higher Education Institutions

---

## 📋 ข้อมูลโปรเจค

**ระยะเวลา:** 8 ตุลาคม 2025 - 7 พฤศจิกายน 2025 (30 วัน)  
**ทีมงาน:** 3 คน (ทุกคนทำทั้ง Frontend + Backend + Database)  
**มหาวิทยาลัย:** มหาวิทยาลัยศรีปทุม  
**รายวิชา:** CSI400 - Web Services

---

## 🎯 วัตถุประสงค์

### วัตถุประสงค์ทั่วไป
เพื่อพัฒนาระบบรับเรื่องร้องเรียนด้านสถานที่ในสถาบันอุดมศึกษาที่เป็นศูนย์กลางการแจ้งปัญหาและติดตามการแก้ไข เพิ่มประสิทธิภาพในการสื่อสารระหว่างผู้ร้องเรียนกับหน่วยงานที่เกี่ยวข้อง

### วัตถุประสงค์เฉพาะ
1. จัดทำระบบที่เปิดโอกาสให้ผู้ใช้ทุกกลุ่มสามารถส่งเรื่องร้องเรียนได้
2. พัฒนาฟังก์ชันการติดตามสถานะและความคืบหน้า
3. จัดหมวดหมู่และลำดับความสำคัญของเรื่องร้องเรียน
4. สร้างระบบแจ้งเตือนและมอบหมายงานอัตโนมัติ
5. จัดทำรายงานและสถิติเพื่อการวางแผนและปรับปรุง

---

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite + SWC
- Tailwind CSS
- React Router v6
- React Icons
- Axios
- Recharts (สำหรับกราฟ)
- React Hook Form

### Backend
- Node.js + Express.js
- JWT (Authentication)
- Multer (File Upload)
- Bcrypt (Password Hashing)
- Nodemailer (Email)
- @line/bot-sdk (LINE Bot - Phase 3)

### Database
- MongoDB + Mongoose

### DevOps & Tools
- Git + GitHub + GitHub Desktop
- Visual Studio Code
- Figma (UI/UX Design)
- Postman/Swagger (API Documentation)

---

## 📊 3 Phases Development Strategy

# **PHASE 1: Single University System (Week 1-2)**
## วันที่ 8-21 ตุลาคม 2025
**เป้าหมาย:** ทำให้มหาวิทยาลัยหนึ่ง (มศป.) และผู้ใช้งานใช้ระบบได้จริง

### Core Features
✅ ระบบ Authentication (Login/Register)  
✅ ระบบรับเรื่องร้องเรียน (CRUD)  
✅ ระบบติดตามสถานะ  
✅ ระบบมอบหมายงาน  
✅ Dashboard พื้นฐาน  
✅ File Upload (รูปภาพ)  
✅ ระบบ Role-based (Admin, Staff, User)

---

# **PHASE 2: Template System (Week 3)**
## วันที่ 22-28 ตุลาคม 2025
**เป้าหมาย:** พัฒนาให้เป็น Template สำหรับมหาวิทยาลัยอื่นใช้ได้

### Additional Features
✅ Multi-tenant Architecture  
✅ University Registration System  
✅ Custom Domain/Subdomain Support  
✅ Configuration Management  
✅ Data Isolation per University  
✅ Template Customization (Logo, Theme, Buildings)

---

# **PHASE 3: Advanced Features (Week 4)**
## วันที่ 29 ตุลาคม - 7 พฤศจิกายน 2025
**เป้าหมาย:** เพิ่มช่องทาง LINE Bot และระบบประชาสัมพันธ์

### Optional Features
✅ LINE Bot Integration  
✅ ระบบประชาสัมพันธ์ข่าวสาร  
✅ Push Notifications  
✅ Advanced Analytics  
✅ Export Reports (PDF/Excel)

---

## 👥 การแบ่งทีมและหน้าที่

### **Person 1: "Authentication & User Management Master" 🔐**
**ความรับผิดชอบหลัก:** ระบบผู้ใช้งาน, Authentication, Authorization

### **Person 2: "Complaint System Master" 📝**
**ความรับผิดชอบหลัก:** ระบบร้องเรียน, File Upload, Status Management

### **Person 3: "Dashboard & Analytics Master" 📊**
**ความรับผิดชอบหลัก:** Dashboard, Reports, Statistics, UI/UX

---

# 📅 PHASE 1: Single University System

## Week 1 (8-14 ตุลาคม): Foundation

### **Person 1: Authentication System** 🔐

#### Backend (Day 1-7)
```javascript
Day 1-2: Project Setup
✅ Setup Node.js + Express + MongoDB
✅ Environment variables configuration
✅ Database connection
✅ Git repository setup
✅ Project structure creation

Day 3-4: User Model & Auth API
✅ User Schema:
   - name, email, password (hashed)
   - role: ['admin', 'staff', 'reporter']
   - university_id (เตรียมไว้สำหรับ Phase 2)
   - created_at, updated_at

✅ API Endpoints:
   POST /api/auth/register
   POST /api/auth/login
   GET  /api/auth/me
   POST /api/auth/forgot-password
   POST /api/auth/reset-password

✅ Middleware:
   - verifyToken (JWT)
   - checkRole(['admin', 'staff'])

Day 5-7: Authorization & Role Management
✅ Role-based middleware
✅ Permission system
✅ PUT /api/users/:id/role (Admin only)
✅ GET /api/users (Admin only)
✅ Testing auth endpoints
```

#### Frontend (Day 1-7)
```javascript
Day 1-2: Project Setup
✅ React + Vite + Tailwind setup
✅ React Router configuration
✅ Axios instance with interceptors
✅ Basic layout structure

Day 3-5: Auth Pages & Components
✅ Components:
   - LoginForm.jsx
   - RegisterForm.jsx
   - ProtectedRoute.jsx
   - RoleGuard.jsx

✅ Pages:
   - /login
   - /register
   - /forgot-password
   - /reset-password

Day 6-7: State Management & Integration
✅ AuthContext.jsx
   - user state
   - login/logout functions
   - token management

✅ API Services:
   - authAPI.js
   - userAPI.js

✅ Connect Frontend ↔ Backend
✅ Test authentication flow
```

#### Database (Day 1-7)
```javascript
// MongoDB Collections

users {
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  role: String (enum: ['admin', 'staff', 'reporter']),
  phone: String (optional),
  university_id: ObjectId (เตรียมไว้ Phase 2),
  is_active: Boolean (default: true),
  created_at: Date,
  updated_at: Date
}

// Indexes
- email (unique)
- university_id + email (composite - สำหรับ Phase 2)
```

---

### **Person 2: Complaint System** 📝

#### Backend (Day 1-7)
```javascript
Day 1-2: Setup & Models
✅ Clone repo & setup environment
✅ Create Models:

complaints {
  _id: ObjectId,
  reporter_id: ObjectId (ref: User),
  category: String (enum: ['น้ำท่วม', 'ไฟฟ้า', 'คอมพิวเตอร์/เว็บไซต์', 'อื่นๆ']),
  title: String (required),
  description: String (required),
  images: [String] (URLs, max 5),
  location: {
    building: String (required),
    floor: String (required),
    room: String (optional)
  },
  status: String (enum: ['pending', 'in_progress', 'resolved', 'cancelled']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  assigned_to: ObjectId (ref: User),
  university_id: ObjectId (Phase 2),
  created_at: Date,
  updated_at: Date,
  resolved_at: Date
}

locations {
  _id: ObjectId,
  building: String,
  floor: String,
  room: String,
  university_id: ObjectId (Phase 2)
}

categories {
  _id: ObjectId,
  name: String,
  description: String,
  auto_assign_dept: String (Phase 2)
}

Day 3-5: Complaint CRUD API
✅ POST   /api/complaints (create)
✅ GET    /api/complaints (list with filters)
✅ GET    /api/complaints/:id (detail)
✅ PATCH  /api/complaints/:id (update)
✅ DELETE /api/complaints/:id (soft delete)
✅ PATCH  /api/complaints/:id/status

✅ Query filters:
   - status, category, priority
   - assigned_to
   - date range
   - search (title, description)
   - pagination

Day 6-7: File Upload & Location API
✅ POST /api/upload (Multer middleware)
✅ Image validation (type, size)
✅ Save to /uploads or cloud storage

✅ GET  /api/locations/buildings
✅ GET  /api/locations/floors/:building
✅ GET  /api/locations/rooms/:building/:floor
✅ POST /api/locations (Admin only)

✅ GET  /api/categories
✅ POST /api/categories (Admin only)
```

#### Frontend (Day 1-7)
```javascript
Day 1-2: UI Components Library
✅ Create reusable components:
   - ComplaintCard.jsx
   - StatusBadge.jsx
   - PriorityBadge.jsx
   - ImageUploader.jsx
   - LocationSelector.jsx (3-level dropdown)
   - LoadingSpinner.jsx
   - EmptyState.jsx

Day 3-5: Complaint Pages
✅ Pages:
   /complaints (List with filters)
   /complaints/new (Create form)
   /complaints/:id (Detail view)
   /my-complaints (User's complaints)
   /assigned-complaints (Staff's assignments)

✅ Components:
   - ComplaintForm.jsx
     * Title, Description
     * Category dropdown
     * Location selector (Building > Floor > Room)
     * Image uploader (max 5, preview)
     * Form validation (React Hook Form)
   
   - ComplaintList.jsx
     * Filter by status, category
     * Search bar
     * Pagination
   
   - ComplaintDetail.jsx
     * Full information
     * Image gallery
     * Status timeline
     * Edit/Delete actions

Day 6-7: Integration & Testing
✅ Connect to backend APIs
✅ API service layer (complaintAPI.js)
✅ Error handling
✅ Success messages
✅ Test all CRUD operations
✅ Test image upload
```

#### Database (Day 1-7)
```javascript
// Additional Collections

complaint_history {
  _id: ObjectId,
  complaint_id: ObjectId,
  action: String (enum: ['created', 'status_changed', 'assigned', 'commented']),
  old_value: String,
  new_value: String,
  comment: String,
  changed_by: ObjectId (ref: User),
  created_at: Date
}

// Indexes
complaints:
- reporter_id
- assigned_to
- status + created_at
- category
- university_id (Phase 2)
```

---

### **Person 3: Dashboard & UI/UX** 📊

#### Backend (Day 1-7)
```javascript
Day 1-2: Setup & Statistics API Planning
✅ Clone repo & setup
✅ Design statistics queries

Day 3-5: Statistics & Dashboard API
✅ GET /api/stats/overview
   Response: {
     total_complaints: Number,
     by_status: {
       pending: Number,
       in_progress: Number,
       resolved: Number,
       cancelled: Number
     },
     by_category: [...],
     by_priority: [...],
     resolution_rate: Number (%)
   }

✅ GET /api/stats/by-location
   - Top 10 locations with most complaints

✅ GET /api/stats/trends?period=7days|30days|90days
   - Daily/weekly complaint counts

✅ GET /api/stats/average-resolution-time

✅ GET /api/staff/performance
   - Assigned vs Resolved
   - Average resolution time per staff

Day 6-7: Export & Helper APIs
✅ GET /api/export/complaints?format=csv|excel
✅ Date range filtering
✅ Test all stat endpoints
```

#### Frontend (Day 1-7)
```javascript
Day 1-3: Landing Page & Layout
✅ Landing Page Components:
   - Hero section
   - Features showcase
   - How it works
   - Statistics preview
   - Footer with contact info
   - Navbar with login/register

✅ Dashboard Layout:
   - Sidebar navigation
   - Header with user profile dropdown
   - Breadcrumbs
   - Responsive menu for mobile

Day 4-5: Dashboard Pages
✅ /dashboard (Overview)
   Components:
   - StatCard.jsx (Total, Pending, In Progress, Resolved)
   - LineChart.jsx (Trend over time)
   - PieChart.jsx (By category)
   - BarChart.jsx (By location)
   - RecentComplaints.jsx (Latest 10)

✅ Recharts Integration:
   - Line chart (trends)
   - Pie chart (categories)
   - Bar chart (locations)

Day 6-7: User Management Page (Admin)
✅ /admin/users
   - User list table
   - Add user modal
   - Edit user modal
   - Change role dropdown
   - Activate/Deactivate toggle
   - Search & filter users

✅ Components:
   - UserTable.jsx
   - UserModal.jsx
   - RoleSelector.jsx
```

---

## Week 2 (15-21 ตุลาคม): Core Features Complete

### **Person 1: Assignment & Notifications** 🔐

#### Backend (Day 8-14)
```javascript
Day 8-10: Assignment System
✅ PATCH /api/complaints/:id/assign
   Body: { assigned_to: user_id }

✅ GET /api/complaints/my-assignments
   - Filter: status, priority
   - Sort by created_at, priority

✅ Auto-assignment logic (optional):
   - Based on category → department
   - Load balancing by staff workload

✅ Assignment validation:
   - Check if staff exists
   - Check if staff has permission

Day 11-12: Email Notifications
✅ Setup Nodemailer
✅ Email templates:
   - New complaint assigned
   - Status changed
   - Complaint resolved

✅ Email service (emailService.js):
   - sendAssignmentEmail()
   - sendStatusUpdateEmail()
   - sendWelcomeEmail()

Day 13-14: Testing & Bug Fixes
✅ Test all assignment flows
✅ Test email sending
✅ Integration testing
✅ Fix Week 1 bugs
✅ Code review & refactoring
```

#### Frontend (Day 8-14)
```javascript
Day 8-10: Assignment UI
✅ Assignment Modal:
   - Staff selection dropdown
   - Auto-complete search
   - Assignment notes

✅ /assigned-complaints (Staff view)
   - My assigned tasks
   - Filter by status
   - Accept/Reject assignment
   - Update status

Day 11-12: Notification UI
✅ NotificationBell.jsx
   - Badge count
   - Dropdown list
   - Mark as read
   - Navigate to complaint

✅ Simple polling (every 30 sec)
✅ Desktop notifications (optional)

Day 13-14: Polish & Testing
✅ Responsive design fixes
✅ Loading states everywhere
✅ Error handling improvements
✅ Toast notifications (react-hot-toast)
✅ Form validation messages
✅ Test all user flows
```

---

### **Person 2: Status Management & Comments** 📝

#### Backend (Day 8-14)
```javascript
Day 8-10: Status Workflow
✅ Status transition validation:
   - pending → in_progress
   - in_progress → resolved
   - any → cancelled (with reason)

✅ PATCH /api/complaints/:id/status
   Body: {
     status: 'in_progress|resolved|cancelled',
     comment: String,
     resolution_notes: String (if resolved)
   }

✅ Auto-save to complaint_history

✅ Calculate resolution time

Day 11-12: Comments & History
✅ POST /api/complaints/:id/comments
   Body: { comment: String }

✅ GET /api/complaints/:id/history
   - Timeline of all changes
   - Comments included

✅ Comments Schema:
   - complaint_id
   - user_id
   - comment
   - created_at

Day 13-14: Search & Filters
✅ Improve search functionality:
   - Full-text search in title + description
   - Advanced filters
   - Sort options

✅ GET /api/complaints/search?q=keyword

✅ Testing & optimization
```

#### Frontend (Day 8-14)
```javascript
Day 8-10: Status Management UI
✅ StatusUpdateModal.jsx
   - Status dropdown
   - Comment textarea
   - Resolution notes (if resolving)
   - Confirmation

✅ StatusTimeline.jsx
   - Visual timeline
   - Show all status changes
   - Show who changed and when

Day 11-12: Comments Section
✅ CommentSection.jsx
   - Comment list
   - Add comment form
   - Real-time updates
   - User avatars

✅ CommentItem.jsx
   - User info
   - Comment text
   - Timestamp
   - Edit/Delete (own comments)

Day 13-14: Advanced Filters & Search
✅ FilterBar.jsx
   - Multiple filter options
   - Clear all button
   - Save filter presets

✅ SearchBar.jsx
   - Autocomplete
   - Search history
   - Advanced search modal

✅ Testing & bug fixes
```

---

### **Person 3: Reports & Analytics** 📊

#### Backend (Day 8-14)
```javascript
Day 8-10: Advanced Analytics
✅ GET /api/stats/resolution-metrics
   - Average time by category
   - Average time by priority
   - Average time by staff

✅ GET /api/stats/heatmap
   - Complaints by building + time
   - Peak hours analysis

✅ GET /api/stats/staff-leaderboard
   - Most resolved complaints
   - Fastest resolution time
   - Current workload

Day 11-12: Export System
✅ Export service (exportService.js)
✅ Generate CSV:
   - All complaints data
   - Custom date range
   - Selected fields

✅ Generate Excel (optional):
   - Multiple sheets
   - Charts included

✅ GET /api/export/report?format=csv|excel
   &start_date=...&end_date=...

Day 13-14: Documentation & Testing
✅ API Documentation (Swagger)
✅ README updates
✅ Test all reports
✅ Performance optimization
```

#### Frontend (Day 8-14)
```javascript
Day 8-10: Advanced Dashboard
✅ Enhanced Charts:
   - Multi-line chart (compare periods)
   - Stacked bar chart
   - Heatmap visualization

✅ DateRangePicker.jsx
✅ ComparisonView.jsx

Day 11-12: Reports Page
✅ /reports
   - Report builder
   - Custom date range
   - Select metrics
   - Export buttons (CSV, Excel, PDF)

✅ PrintableReport.jsx
   - Print-friendly layout
   - Charts included
   - Summary statistics

Day 13-14: UI Polish
✅ Mobile responsiveness
✅ Accessibility (ARIA labels)
✅ Loading skeletons
✅ Error boundaries
✅ Empty states
✅ Success animations
```

---

## 🎯 PHASE 1 Deliverables (End of Week 2)

### ✅ Completed Features
- [x] User authentication (Login, Register, Forgot Password)
- [x] Role-based access control (Admin, Staff, Reporter)
- [x] Complaint CRUD operations
- [x] File upload (images)
- [x] Location selection (Building > Floor > Room)
- [x] Status management workflow
- [x] Assignment system
- [x] Comments and history
- [x] Email notifications
- [x] Dashboard with statistics
- [x] Advanced filters and search
- [x] Reports and export
- [x] Responsive design

### 🧪 Testing Checklist
- [ ] All API endpoints tested
- [ ] All user flows tested
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing
- [ ] Performance testing
- [ ] Security testing

---

# 📅 PHASE 2: Template System

## Week 3 (22-28 ตุลาคม): Multi-Tenant Architecture

### **Person 1: University Management** 🔐

#### Backend (Day 15-21)
```javascript
Day 15-17: Multi-Tenant Database
✅ University/Tenant Model:

universities {
  _id: ObjectId,
  name: String (e.g., "มหาวิทยาลัยศรีปทุม"),
  subdomain: String (unique, e.g., "spu"),
  domain: String (optional, e.g., "complaints.spu.ac.th"),
  logo_url: String,
  theme_color: String (hex),
  contact_email: String,
  contact_phone: String,
  api_key: String (hashed),
  is_active: Boolean,
  settings: {
    auto_assignment: Boolean,
    email_notifications: Boolean,
    line_notifications: Boolean
  },
  created_at: Date,
  updated_at: Date
}

✅ Tenant Registration:
POST /api/tenants/register
Body: {
  name, subdomain, contact_email,
  contact_phone, admin_user
}

✅ Generate API Key
✅ Create default admin user
✅ Initialize default categories & locations

Day 18-19: Tenant Middleware
✅ Middleware: extractTenant
   - From subdomain (e.g., spu.complaints.com)
   - From API key header
   - Attach tenant to req.tenant

✅ Middleware: tenantIsolation
   - Auto-filter all queries by tenant_id
   - Prevent cross-tenant data access

✅ Update all models to include tenant_id

Day 20-21: Tenant Management API
✅ GET    /api/tenants (Super Admin)
✅ GET    /api/tenants/:id
✅ PATCH  /api/tenants/:id (Update settings)
✅ DELETE /api/tenants/:id (Deactivate)

✅ Testing multi-tenant isolation
```

#### Frontend (Day 15-21)
```javascript
Day 15-17: University Registration
✅ Landing Page Updates:
   - "Start Free Trial" button
   - Feature comparison table
   - Pricing plans (optional)

✅ /register-university
   Components:
   - UniversityRegistrationForm.jsx
     * University name
     * Subdomain selection (validate availability)
     * Contact info
     * Admin account setup
     * Terms & Conditions

Day 18-19: Tenant Context
✅ TenantContext.jsx
   - Detect tenant from URL
   - Fetch tenant info
   - Apply theme color
   - Show tenant logo

✅ Tenant-aware routing
✅ Custom domain support

Day 20-21: Admin Settings
✅ /admin/university-settings
   - Update university info
   - Upload logo
   - Change theme color
   - Configure auto-assignment
   - Email/LINE toggle

✅ SettingsForm.jsx
✅ LogoUploader.jsx
✅ ColorPicker.jsx
```

---

### **Person 2: Template Configuration** 📝

#### Backend (Day 15-21)
```javascript
Day 15-17: Template Data Management
✅ Default Template Data:
   - Default categories
   - Sample locations structure
   - Initial settings

✅ POST /api/tenants/:id/initialize
   - Create default data for new tenant
   - Import template configuration

✅ Template Export/Import:
   - Export current config as JSON
   - Import config from JSON

Day 18-19: Location Management API
✅ Enhanced Location API:
GET    /api/locations (tenant-specific)
POST   /api/locations/import (Bulk import)
GET    /api/locations/export (Export as JSON)
DELETE /api/locations/:id

✅ Support for:
   - Bulk operations
   - CSV import
   - Template copying

Day 20-21: Data Seeding & Migration
✅ Seed script for new tenants
✅ Migration tools
✅ Data validation
✅ Testing with multiple tenants
```

#### Frontend (Day 15-21)
```javascript
Day 15-17: Template Customization UI
✅ /admin/template-settings
   - Configure default categories
   - Configure default locations
   - Set up departments
   - Default email templates

Day 18-19: Location Builder
✅ LocationBuilder.jsx
   - Add/Edit/Delete buildings
   - Add/Edit/Delete floors
   - Add/Edit/Delete rooms
   - Drag & drop hierarchy
   - Bulk import from CSV

✅ CategoryManager.jsx
   - Add/Edit/Delete categories
   - Assign to departments
   - Set default priority

Day 20-21: Import/Export Tools
✅ ConfigImporter.jsx
   - Upload JSON config
   - Preview before import
   - Validation

✅ ConfigExporter.jsx
   - Select data to export
   - Generate JSON
   - Download file
```

---

### **Person 3: Subdomain & Theming** 📊

#### Backend (Day 15-21)
```javascript
Day 15-17: Subdomain Routing
✅ Setup wildcard subdomain support
✅ Nginx/Server configuration
✅ DNS configuration guide

✅ Middleware: detectSubdomain
   - Parse subdomain from request
   - Fetch tenant data
   - 404 if tenant not found

Day 18-19: Theme & Branding API
✅ GET /api/tenants/:id/theme
   Response: {
     logo_url, theme_color,
     primary_color, secondary_color,
     custom_css (optional)
   }

✅ POST /api/upload/logo
✅ POST /api/upload/favicon

Day 20-21: Documentation & Testing
✅ Setup guide for new universities
✅ Video tutorial (optional)
✅ Test multi-tenant deployment
```

#### Frontend (Day 15-21)
```javascript
Day 15-17: Dynamic Theming
✅ ThemeProvider.jsx
   - Load theme from tenant
   - Apply CSS variables
   - Update favicon
   - Update page title

✅ Dynamic Tailwind colors:
   - Primary: theme.primary
   - Secondary: theme.secondary

Day 18-19: White-label UI
✅ CustomBranding.jsx
   - Show tenant logo in navbar
   - Show tenant name
   - Custom footer

✅ /admin/branding
   - Upload logo
   - Upload favicon
   - Select theme colors
   - Preview changes

Day 20-21: Demo & Documentation
✅ Create demo video
✅ User guide PDF
✅ Admin guide PDF
✅ API documentation
```

---

## 🎯 PHASE 2 Deliverables (End of Week 3)

### ✅ Additional Features
- [x] Multi-tenant architecture
- [x] University registration system
- [x] Tenant isolation (data security)
- [x] Subdomain routing
- [x] Custom branding (logo, theme)
- [x] Template configuration
- [x] Location/Category templates
- [x] Import/Export tools
- [x] Setup documentation

### 🧪 Multi-Tenant Testing
- [ ] Test with 3+ dummy universities
- [ ] Verify data isolation
- [ ] Test subdomain routing
- [ ] Test custom themes
- [ ] Test import/export

---

# 📅 PHASE 3: Advanced Features

## Week 4 (29 ตุลาคม - 7 พฤศจิกายน): LINE Bot & Announcements

### **Person 1: LINE Bot Integration** 🤖

#### Backend (Day 22-30)
```javascript
Day 22-24: LINE Bot Setup
✅ LINE Developers Console setup
✅ Install @line/bot-sdk

✅ LINE Bot Service (lineService.js):
   - Initialize LINE Client
   - Handle webhook events
   - Send messages
   - Send rich messages

✅ POST /webhook/line
   - Verify signature
   - Handle text messages
   - Handle image messages
   - Handle location (optional)

Day 25-27: LINE Bot Features
✅ Bot Commands:
   - "แจ้งปัญหา" → start complaint flow
   - "ตรวจสอบสถานะ" → show my complaints
   - "ดูรหัส" → show user ID
   - "ช่วยเหลือ" → show help menu

✅ Create complaint via LINE:
   1. User sends text → description
   2. Bot asks for location
   3. User selects from rich menu
   4. Bot asks for image (optional)
   5. Create complaint
   6. Reply with complaint ID

✅ Status notifications via LINE:
   - When assigned
   - When status changes
   - When resolved

Day 28-30: LINE Integration Testing
✅ Test all LINE flows
✅ Rich menu setup
✅ Error handling
✅ Integration with existing system
```

#### Frontend (Day 22-30)
```javascript
Day 22-24: LINE Integration Settings
✅ /admin/line-settings
   Components:
   - LineConfigForm.jsx
     * Channel Access Token input
     * Channel Secret input
     * Webhook URL display
     * Test connection button
     * QR Code display

✅ LINE Setup Guide page:
   - Step-by-step instructions
   - Screenshots
   - Video tutorial

Day 25-27: LINE User Management
✅ Link LINE users to system:
   - Store LINE User ID
   - Map to system user
   - Unlink function

✅ /profile/line-integration
   - Show LINE connection status
   - Connect LINE account
   - Disconnect LINE account

Day 28-30: LINE Notification Settings
✅ User notification preferences:
   - Enable/Disable LINE notifications
   - Choose notification types
   - Test send notification

✅ NotificationSettingsForm.jsx
✅ Testing & bug fixes
```

---

### **Person 2: Announcement System** 📢

#### Backend (Day 22-30)
```javascript
Day 22-24: Announcement Model & API
✅ Announcement Schema:

announcements {
  _id: ObjectId,
  tenant_id: ObjectId,
  title: String (required),
  content: String (required),
  type: String (enum: ['info', 'warning', 'urgent', 'event']),
  images: [String] (URLs),
  attachments: [String] (URLs),
  target_audience: String (enum: ['all', 'students', 'staff', 'faculty']),
  is_pinned: Boolean,
  is_active: Boolean,
  start_date: Date,
  end_date: Date,
  created_by: ObjectId (ref: User),
  view_count: Number,
  created_at: Date,
  updated_at: Date
}

✅ API Endpoints:
POST   /api/announcements
GET    /api/announcements (with filters)
GET    /api/announcements/:id
PATCH  /api/announcements/:id
DELETE /api/announcements/:id
POST   /api/announcements/:id/view (increment view count)

Day 25-27: Notification Integration
✅ Send announcement notifications:
   - Email to users
   - LINE push notification
   - Web push notification

✅ notificationService.js:
   - sendAnnouncementNotification()
   - sendToTargetAudience()
   - Schedule announcement

✅ POST /api/announcements/:id/notify
   - Send to all users
   - Send to specific roles

Day 28-30: Analytics & Testing
✅ GET /api/announcements/:id/analytics
   - View count
   - Click rate
   - User engagement

✅ Testing all announcement features
```

#### Frontend (Day 22-30)
```javascript
Day 22-24: Announcement UI
✅ Public Announcement Pages:
   /announcements (List view)
   /announcements/:id (Detail view)

✅ Components:
   - AnnouncementCard.jsx
     * Title, excerpt
     * Type badge (info/warning/urgent)
     * Date
     * View count
   
   - AnnouncementDetail.jsx
     * Full content
     * Images gallery
     * Attachments download
     * Share buttons

✅ Homepage Integration:
   - Show pinned announcements
   - Show latest 3 announcements
   - "View All" link

Day 25-27: Announcement Management (Admin)
✅ /admin/announcements
   - Announcement list table
   - Create button
   - Edit/Delete actions
   - Pin/Unpin toggle
   - Activate/Deactivate

✅ /admin/announcements/new
✅ /admin/announcements/:id/edit

✅ Components:
   - AnnouncementForm.jsx
     * Title, Content (Rich text editor)
     * Type selector
     * Target audience
     * Date range picker
     * Image uploader
     * File attachments
     * Pin checkbox
     * Send notification checkbox

Day 28-30: Notification UI
✅ AnnouncementNotification.jsx
   - Show new announcements
   - Mark as read
   - Navigate to detail

✅ /notifications (Notification center)
   - List all notifications
   - Filter by type
   - Mark all as read

✅ Testing & polish
```

---

### **Person 3: Push Notifications & Final Polish** 🎨

#### Backend (Day 22-30)
```javascript
Day 22-24: Push Notification System
✅ Setup Firebase Cloud Messaging (optional)

✅ Notification Model:

notifications {
  _id: ObjectId,
  user_id: ObjectId,
  tenant_id: ObjectId,
  type: String (enum: ['complaint', 'assignment', 'announcement']),
  title: String,
  message: String,
  link: String (URL to navigate),
  is_read: Boolean,
  created_at: Date
}

✅ API Endpoints:
GET   /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
DELETE /api/notifications/:id

✅ Create notifications for:
   - New complaint assigned
   - Status changed
   - New announcement
   - Comment added

Day 25-27: Final API Optimization
✅ Database indexing
✅ Query optimization
✅ Caching strategy (optional)
✅ Rate limiting
✅ API response time optimization

✅ Security hardening:
   - Input validation
   - XSS prevention
   - SQL injection prevention
   - CORS configuration

Day 28-30: API Documentation
✅ Swagger/OpenAPI documentation
✅ Postman collection
✅ API usage examples
✅ Authentication guide
```

#### Frontend (Day 22-30)
```javascript
Day 22-24: Notification Center
✅ NotificationDropdown.jsx
   - Real-time badge count
   - List notifications
   - Mark as read on click
   - "Mark all as read"
   - "View all" link

✅ /notifications (Full page)
   - Infinite scroll
   - Filter by type
   - Group by date
   - Clear all

Day 25-27: Final UI/UX Polish
✅ Responsive design review:
   - Mobile (< 640px)
   - Tablet (640-1024px)
   - Desktop (> 1024px)

✅ Animations & Transitions:
   - Page transitions
   - Loading animations
   - Hover effects
   - Button feedback

✅ Accessibility improvements:
   - Keyboard navigation
   - ARIA labels
   - Focus states
   - Color contrast (WCAG AA)
   - Screen reader support

✅ Error handling:
   - Better error messages
   - Error boundaries
   - Offline detection
   - Network error handling

Day 28-30: Final Testing & Deployment
✅ User acceptance testing
✅ Bug fixes
✅ Performance optimization
✅ Build production bundle
✅ Deploy to production
```

---

## 🎯 PHASE 3 Deliverables (End of Week 4)

### ✅ Advanced Features
- [x] LINE Bot integration
- [x] Announcement system
- [x] Push notifications
- [x] Notification center
- [x] Rich text editor
- [x] Advanced analytics
- [x] API documentation
- [x] Production-ready deployment

---

# 📅 Final Week Schedule (29 ต.ค. - 7 พ.ย.)

## Day 22-24: Integration & LINE Bot
- **Person 1:** LINE Bot setup & webhook
- **Person 2:** Announcement system
- **Person 3:** Push notifications

## Day 25-27: Features Complete
- **Person 1:** LINE Bot features & testing
- **Person 2:** Notification integration
- **Person 3:** UI polish & optimization

## Day 28: Final Testing Day (ทุกคน)
```
Morning (9:00-12:00):
- Integration testing
- Bug bash (หา bugs ในส่วนของคนอื่น)
- Create bug list
- Prioritize bugs

Afternoon (13:00-17:00):
- Fix critical bugs
- Regression testing
- Performance testing
```

## Day 29: Deployment Day (ทุกคน)
```
Person 1: Backend Deployment
✅ Deploy to Railway/Render/Heroku
✅ MongoDB Atlas setup
✅ Environment variables
✅ Test production API
✅ Setup monitoring

Person 2: Frontend Deployment
✅ Build production bundle
✅ Deploy to Vercel/Netlify
✅ Connect to production API
✅ Test production site
✅ Setup custom domain (optional)

Person 3: Documentation
✅ User manual (PDF)
✅ Admin guide (PDF)
✅ Setup guide for new universities
✅ API documentation finalize
✅ Video tutorials (optional)
```

## Day 30 (7 พ.ย.): Presentation Day
```
Morning:
✅ Prepare demo data
✅ Rehearse presentation
✅ Test demo flow
✅ Backup video recording
✅ Print handouts

Presentation Content:
1. Problem statement (2 min)
2. Solution overview (3 min)
3. System architecture (3 min)
4. Live demo (10 min):
   - User registers & submits complaint
   - Staff receives & updates status
   - Admin views dashboard
   - LINE Bot demo
   - Announcement system
5. Technical highlights (2 min)
6. Q&A (5 min)

Afternoon:
✅ Final submission
✅ Celebrate! 🎉
```

---

# 📂 Complete Project Structure

```
MyUsafe-ReportProject/
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── line.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── University.js
│   │   │   ├── Complaint.js
│   │   │   ├── Location.js
│   │   │   ├── Category.js
│   │   │   ├── Announcement.js
│   │   │   ├── Notification.js
│   │   │   └── ComplaintHistory.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── universities.js
│   │   │   ├── complaints.js
│   │   │   ├── locations.js
│   │   │   ├── categories.js
│   │   │   ├── announcements.js
│   │   │   ├── notifications.js
│   │   │   ├── stats.js
│   │   │   ├── export.js
│   │   │   └── webhooks.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── tenant.js
│   │   │   ├── upload.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── complaintController.js
│   │   │   ├── universityController.js
│   │   │   └── statsController.js
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   ├── lineService.js
│   │   │   ├── notificationService.js
│   │   │   └── exportService.js
│   │   └── utils/
│   │       ├── validators.js
│   │       ├── helpers.js
│   │       └── constants.js
│   ├── uploads/
│   ├── .env
│   ├── package-lock.json
│   ├── package.json
│   ├── README.txt
│   └── server.js
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   ├── ForgotPasswordForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   ├── complaints/
│   │   │   │   ├── ComplaintCard.jsx
│   │   │   │   ├── ComplaintForm.jsx
│   │   │   │   ├── ComplaintList.jsx
│   │   │   │   ├── ComplaintDetail.jsx
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── PriorityBadge.jsx
│   │   │   │   ├── StatusTimeline.jsx
│   │   │   │   ├── CommentSection.jsx
│   │   │   │   └── AssignmentModal.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── LineChart.jsx
│   │   │   │   ├── PieChart.jsx
│   │   │   │   ├── BarChart.jsx
│   │   │   │   └── RecentComplaints.jsx
│   │   │   ├── users/
│   │   │   │   ├── UserTable.jsx
│   │   │   │   ├── UserModal.jsx
│   │   │   │   └── RoleSelector.jsx
│   │   │   ├── announcements/
│   │   │   │   ├── AnnouncementCard.jsx
│   │   │   │   ├── AnnouncementDetail.jsx
│   │   │   │   ├── AnnouncementForm.jsx
│   │   │   │   └── AnnouncementList.jsx
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   ├── NotificationDropdown.jsx
│   │   │   │   └── NotificationItem.jsx
│   │   │   └── upload/
│   │   │       ├── ImageUploader.jsx
│   │   │       ├── FileUploader.jsx
│   │   │       └── ImageGallery.jsx
│   │   ├── pages/
│   │   │   ├── publicInPages/
│   │   │   │   ├── Landing.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ForgotPassword.jsx
│   │   │   ├── user/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyComplaints.jsx
│   │   │   │   ├── CreateComplaint.jsx
│   │   │   │   ├── ComplaintDetail.jsx
│   │   │   │   ├── Announcements.jsx
│   │   │   │   ├── AnnouncementDetail.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── Notifications.jsx
│   │   │   ├── staff/
│   │   │   │   ├── AssignedComplaints.jsx
│   │   │   │   └── MyPerformance.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── ComplaintManagement.jsx
│   │   │       ├── LocationManagement.jsx
│   │   │       ├── CategoryManagement.jsx
│   │   │       ├── AnnouncementManagement.jsx
│   │   │       ├── UniversitySettings.jsx
│   │   │       ├── LINESettings.jsx
│   │   │       ├── Reports.jsx
│   │   │       └── TemplateSettings.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── TenantContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authAPI.js
│   │   │   ├── complaintAPI.js
│   │   │   ├── userAPI.js
│   │   │   ├── announcementAPI.js
│   │   │   ├── notificationAPI.js
│   │   │   └── statsAPI.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useTenant.js
│   │   │   ├── useComplaints.js
│   │   │   └── useNotifications.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── validators.js
│   │   │   └── dateFormat.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
├── .gitignore
├── project_readme.txt
└── README.txt
```

---

# 🚀 Quick Start Commands

## Backend Setup
```bash
cd backend
npm init -y

# Install dependencies
npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer nodemailer @line/bot-sdk

# Install dev dependencies
npm install -D nodemon

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/complaint-system
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Email (Nodemailer with Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# LINE Bot (Phase 3)
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF

# Add scripts to package.json
npm pkg set scripts.dev="nodemon src/server.js"
npm pkg set scripts.start="node src/server.js"

# Run
npm run dev
```

## Frontend Setup
```bash
# Create React + Vite project
npm create vite@latest frontend -- --template react-swc
cd frontend

# Install dependencies
npm install

# Install UI libraries
npm install react-router-dom axios react-icons recharts react-hook-form

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Additional libraries
npm install react-hot-toast date-fns

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Complaint System
EOF

# Configure Tailwind (tailwind.config.js)
cat > tailwind.config.js << EOF
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
EOF

# Add Tailwind to CSS (src/index.css)
cat > src/index.css << EOF
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Run
npm run dev
```

---

# 📚 Database Schemas (Complete)

## MongoDB Collections

### 1. users
```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId, // ref: universities
  name: String,
  email: String, // unique per tenant
  password: String, // bcrypt hashed
  role: String, // enum: ['admin', 'staff', 'reporter']
  phone: String,
  line_user_id: String, // Phase 3
  notification_preferences: {
    email: Boolean,
    line: Boolean,
    push: Boolean
  },
  is_active: Boolean,
  last_login: Date,
  created_at: Date,
  updated_at: Date
}

// Indexes
- { tenant_id: 1, email: 1 } unique
- { tenant_id: 1, role: 1 }
- { line_user_id: 1 }
```

### 2. universities (tenants)
```javascript
{
  _id: ObjectId,
  name: String, // "มหาวิทยาลัยศรีปทุม"
  name_en: String, // "Sripatum University"
  subdomain: String, // "spu" unique
  domain: String, // "complaints.spu.ac.th" optional
  logo_url: String,
  favicon_url: String,
  theme_color: String, // hex color
  contact_email: String,
  contact_phone: String,
  address: String,
  api_key: String, // hashed, for API access
  settings: {
    auto_assignment: Boolean,
    require_approval: Boolean,
    email_notifications: Boolean,
    line_notifications: Boolean,
    allow_anonymous: Boolean
  },
  is_active: Boolean,
  trial_end_date: Date,
  subscription_plan: String, // 'free', 'basic', 'premium'
  created_at: Date,
  updated_at: Date
}

// Indexes
- { subdomain: 1 } unique
- { domain: 1 } sparse unique
- { api_key: 1 }
```

### 3. complaints
```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId, // ref: universities
  complaint_number: String, // auto-generated "C2025-001"
  reporter_id: ObjectId, // ref: users
  
  title: String,
  description: String,
  category: String, // 'น้ำท่วม', 'ไฟฟ้า', 'คอมพิวเตอร์', 'อื่นๆ'
  
  location: {
    building: String,
    floor: String,
    room: String,
    description: String // เพิ่มเติม
  },
  
  images: [String], // URLs, max 5
  attachments: [String], // URLs
  
  status: String, // 'pending', 'in_progress', 'resolved', 'cancelled'
  priority: String, // 'low', 'medium', 'high', 'urgent'
  
  assigned_to: ObjectId, // ref: users
  assigned_at: Date,
  
  resolution_notes: String,
  resolution_images: [String],
  resolved_at: Date,
  
  cancellation_reason: String,
  cancelled_at: Date,
  
  view_count: Number,
  
  source: String, // 'web', 'line', 'mobile'
  
  created_at: Date,
  updated_at: Date
}

// Indexes
- { tenant_id: 1, created_at: -1 }
- { tenant_id: 1, status: 1 }
- { tenant_id: 1, reporter_id: 1 }
- { tenant_id: 1, assigned_to: 1 }
- { tenant_id: 1, complaint_number: 1 } unique
- { status: 1, priority: 1 }
```

### 4. complaint_history
```javascript
{
  _id: ObjectId,
  complaint_id: ObjectId, // ref: complaints
  tenant_id: ObjectId,
  action: String, // 'created', 'status_changed', 'assigned', 'commented', 'resolved'
  old_value: String,
  new_value: String,
  comment: String,
  images: [String],
  changed_by: ObjectId, // ref: users
  created_at: Date
}

// Indexes
- { complaint_id: 1, created_at: -1 }
- { tenant_id: 1 }
```

### 5. locations
```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,
  building: String,
  floor: String,
  room: String,
  description: String,
  is_active: Boolean,
  created_at: Date
}

// Indexes
- { tenant_id: 1, building: 1, floor: 1, room: 1 } unique
- { tenant_id: 1, is_active: 1 }
```

### 6. categories
```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,
  name: String,
  description: String,
  icon: String, // icon name from React Icons
  color: String, // hex color
  auto_assign_dept: String,
  default_priority: String,
  is_active: Boolean,
  created_at: Date
}

// Indexes
- { tenant_id: 1, name: 1 }
- { tenant_id: 1, is_active: 1 }
```

### 7. announcements
```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,
  title: String,
  content: String, // HTML from rich text editor
  excerpt: String, // short description
  type: String, // 'info', 'warning', 'urgent', 'event'
  
  images: [String],
  attachments: [{
    name: String,
    url: String,
    size: Number
  }],
  
  target_audience: String, // 'all', 'students', 'staff', 'faculty'
  
  is_pinned: Boolean,
  is_active: Boolean,
  
  start_date: Date,
  end_date: Date,
  
  view_count: Number,
  like_count: Number,
  
  created_by: ObjectId, // ref: users
  created_at: Date,
  updated_at: Date
}

// Indexes
- { tenant_id: 1, is_active: 1, start_date: -1 }
- { tenant_id: 1, is_pinned: 1 }
- { tenant_id: 1, target_audience: 1 }
```

### 8. notifications
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // ref: users
  tenant_id: ObjectId,
  
  type: String, // 'complaint', 'assignment', 'status_change', 'announcement', 'comment'
  title: String,
  message: String,
  
  link: String, // URL to navigate
  related_id: ObjectId, // complaint_id or announcement_id
  
  is_read: Boolean,
  read_at: Date,
  
  sent_via: [String], // ['web', 'email', 'line']
  
  created_at: Date
}

// Indexes
- { user_id: 1, is_read: 1, created_at: -1 }
- { tenant_id: 1, created_at: -1 }
```

---

# 📊 API Endpoints Summary

## Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/logout
```

## Users
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
PUT    /api/users/:id/role
PATCH  /api/users/:id/activate
PATCH  /api/users/:id/deactivate
```

## Universities/Tenants
```
POST   /api/tenants/register
GET    /api/tenants
GET    /api/tenants/:id
PATCH  /api/tenants/:id
DELETE /api/tenants/:id
POST   /api/tenants/:id/initialize
GET    /api/tenants/:id/theme
```

## Complaints
```
POST   /api/complaints
GET    /api/complaints
GET    /api/complaints/:id
PATCH  /api/complaints/:id
DELETE /api/complaints/:id
PATCH  /api/complaints/:id/status
PATCH  /api/complaints/:id/assign
POST   /api/complaints/:id/comments
GET    /api/complaints/:id/history
GET    /api/complaints/my-complaints
GET    /api/complaints/my-assignments
```

## Locations
```
GET    /api/locations
POST   /api/locations
GET    /api/locations/buildings
GET    /api/locations/floors/:building
GET    /api/locations/rooms/:building/:floor
DELETE /api/locations/:id
POST   /api/locations/import
GET    /api/locations/export
```

## Categories
```
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

## Announcements
```
POST   /api/announcements
GET    /api/announcements
GET    /api/announcements/:id
PATCH  /api/announcements/:id
DELETE /api/announcements/:id
POST   /api/announcements/:id/notify
POST   /api/announcements/:id/view
GET    /api/announcements/:id/analytics
```

## Notifications
```
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
GET    /api/notifications/unread-count
```

## Statistics
```
GET    /api/stats/overview
GET    /api/stats/by-location
GET    /api/stats/by-category
GET    /api/stats/trends
GET    /api/stats/resolution-metrics
GET    /api/stats/staff-performance
GET    /api/stats/heatmap
```

## Export
```
GET    /api/export/complaints?format=csv|excel
GET    /api/export/report
```

## File Upload
```
POST   /api/upload/image
POST   /api/upload/file
POST   /api/upload/logo
POST   /api/upload/favicon
```

## Webhooks
```
POST   /webhook/line
```

---

# ✅ Definition of Done Checklist

## For Each Feature
- [ ] Code เขียนเสร็จและทำงานถูกต้อง
- [ ] Test ผ่านใน local environment
- [ ] API tested with Postman
- [ ] Frontend UI completed and responsive
- [ ] Error handling implemented
- [ ] Git commit with clear message
- [ ] Push to GitHub
- [ ] No merge conflicts
- [ ] Code reviewed by team member
- [ ] Documentation updated (if needed)

## Phase Completion Criteria

### Phase 1 Complete When:
- [ ] All authentication flows work
- [ ] Complaint CRUD fully functional
- [ ] File upload working
- [ ] Status management working
- [ ] Assignment system working
- [ ] Dashboard shows correct data
- [ ] Email notifications sent
- [ ] Responsive on mobile
- [ ] No critical bugs

### Phase 2 Complete When:
- [ ] Multiple universities can register
- [ ] Data isolation verified (cannot see other tenant data)
- [ ] Subdomain routing works
- [ ] Custom branding applies correctly
- [ ] Template import/export works
- [ ] Configuration persists correctly

### Phase 3 Complete When:
- [ ] LINE Bot responds correctly
- [ ] Can create complaint via LINE
- [ ] Status updates sent to LINE
- [ ] Announcements display correctly
- [ ] Push notifications work
- [ ] All features integrated smoothly

---

# 🎯 Daily Standup Format

## Every Morning (15 minutes)
```
Person 1:
Yesterday: [what I completed]
Today: [what I will work on]
Blockers: [any issues or dependencies]

Person 2:
Yesterday: [what I completed]
Today: [what I will work on]
Blockers: [any issues or dependencies]

Person 3:
Yesterday: [what I completed]
Today: [what I will work on]
Blockers: [any issues or dependencies]

Team Decisions:
- [any quick decisions needed]
- [help needed from others]
```

---

# 🚨 Risk Management & Contingency Plans

## If Features Taking Too Long

### Phase 1 (Critical - Must Complete)
**Cannot skip any features**
- Work extra hours if needed
- Help each other with difficult tasks
- Simplify UI (but keep functionality)

### Phase 2 (Important - Try to Complete)
**If running out of time:**
- Skip custom domain support (use subdomain only)
- Skip import/export tools (manual setup OK)
- Simplify configuration UI

### Phase 3 (Nice to Have - Can Skip)
**Priority if time is short:**
1. Skip LINE Bot entirely → Focus on web only
2. Skip Announcement system → Just show static info
3. Skip advanced analytics → Basic stats only
4. Skip export reports → View on screen only

## If Team Member Unavailable
```
Backup Person 1 (Auth): Person 2
Backup Person 2 (Complaints): Person 3  
Backup Person 3 (Dashboard): Person 1

Always commit code at end of day so others can continue!
```

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
```bash
# Solution 1: Check if MongoDB is running
sudo systemctl status mongod

# Solution 2: Use MongoDB Atlas (cloud)
1. Create free cluster at mongodb.com/cloud/atlas
2. Get connection string
3. Update MONGODB_URI in .env
```

### Issue: CORS Error
```javascript
// backend/src/server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Issue: File Upload Not Working
```javascript
// Check folder exists
const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
```

### Issue: JWT Token Expired
```javascript
// Frontend: Add interceptor to refresh token
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

# 💡 Best Practices & Tips

## Git Workflow
```bash
# Daily workflow
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/complaint-crud

# Work on feature...
# Commit often
git add .
git commit -m "feat: add complaint create endpoint"

# Push to GitHub
git push origin feature/complaint-crud

# Create Pull Request on GitHub
# Get review from team member
# Merge to dev branch

# Delete feature branch after merge
git branch -d feature/complaint-crud
```

## Branch Naming Convention
```
feature/   - New feature
fix/       - Bug fix
refactor/  - Code refactoring
docs/      - Documentation
style/     - UI/styling changes

Examples:
feature/auth-system
feature/complaint-crud
fix/login-validation
refactor/api-structure
docs/api-documentation
style/dashboard-layout
```

## Commit Message Format
```
type: subject

Types:
feat:     New feature
fix:      Bug fix
refactor: Code refactoring
style:    Styling changes
docs:     Documentation
test:     Testing
chore:    Maintenance

Examples:
feat: add user registration endpoint
fix: resolve login token expiration issue
refactor: improve complaint query performance
style: update dashboard card design
docs: add API endpoint documentation
test: add unit tests for auth service
chore: update dependencies
```

## Code Review Checklist
- [ ] Code follows project structure
- [ ] No console.log() or commented code
- [ ] Variables named clearly
- [ ] Functions are small and focused
- [ ] Error handling implemented
- [ ] No hardcoded values (use constants/env)
- [ ] Comments for complex logic
- [ ] No security vulnerabilities
- [ ] Responsive design (if frontend)

## Testing Tips
```javascript
// Backend: Test with Postman
1. Save requests in collection
2. Use environment variables
3. Test all status codes
4. Test error cases
5. Export collection for team

// Frontend: Manual Testing
1. Test on Chrome, Firefox, Safari
2. Test on mobile (Chrome DevTools)
3. Test all user roles
4. Test edge cases (empty data, long text)
5. Test error messages display correctly
```

---

# 📖 Useful Resources

## Documentation Links
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Express.js:** https://expressjs.com/
- **Mongoose:** https://mongoosejs.com/docs/
- **React Router:** https://reactrouter.com/
- **Recharts:** https://recharts.org/
- **LINE Bot SDK:** https://github.com/line/line-bot-sdk-nodejs
- **Nodemailer:** https://nodemailer.com/

## Learning Resources
- **MongoDB University:** https://university.mongodb.com/
- **JWT.io:** https://jwt.io/ (decode tokens)
- **Postman Learning:** https://learning.postman.com/
- **Git Tutorial:** https://www.atlassian.com/git/tutorials

## Tools
- **MongoDB Compass:** GUI for MongoDB
- **Postman:** API testing
- **VS Code Extensions:**
  - ESLint
  - Prettier
  - ES7+ React/Redux snippets
  - Tailwind CSS IntelliSense
  - MongoDB for VS Code

---

# 📞 Communication Plan

## Daily Communication
- **Morning Standup:** 9:00 AM (15 min) - via Discord/Google Meet
- **End of Day:** Update on progress in group chat
- **Urgent Issues:** Call/message immediately

## Weekly Meetings
- **Week 1 Sunday:** Review progress, plan Week 2
- **Week 2 Sunday:** Review progress, plan Week 3  
- **Week 3 Sunday:** Review progress, plan Week 4
- **Week 4 Monday:** Final push planning

## Communication Channels
- **LINE Group:** Quick questions, daily updates
- **Discord/Slack:** Screen sharing, voice calls
- **GitHub Issues:** Track bugs and tasks
- **Google Docs:** Shared documentation

---

# 🎓 Presentation Preparation

## Slides Outline (20 slides max)

### 1. Title Slide
- Project name
- Team members
- Date

### 2-3. Problem Statement
- Current issues in universities
- Why this system is needed
- Statistics (if any)

### 4-5. Solution Overview
- What is the system
- Who are the users
- Main benefits

### 6-7. System Architecture
- System diagram
- Technology stack
- Why these technologies

### 8-15. Live Demo (Most Important!)
**Scenario 1: Student Reports Problem (3 min)**
- Register/Login
- Submit complaint with images
- Check status
- Show LINE Bot (if ready)

**Scenario 2: Staff Handles Complaint (2 min)**
- Login as staff
- See assigned complaint
- Update status
- Add comments

**Scenario 3: Admin Dashboard (2 min)**
- Login as admin
- View statistics
- See all complaints
- Manage users
- Post announcement

**Scenario 4: Multi-Tenant (2 min - Phase 2)**
- Show different university using same system
- Different branding
- Data isolation

### 16. Technical Highlights
- Multi-tenant architecture
- Real-time notifications
- File upload system
- Responsive design
- Template system

### 17. Challenges & Solutions
- Problem 1 → How we solved it
- Problem 2 → How we solved it
- What we learned

### 18. Future Enhancements
- Mobile app
- Real-time WebSocket
- AI categorization
- Analytics ML
- IoT integration

### 19. Summary
- What we achieved
- Team effort
- Thank you

### 20. Q&A
- Questions slide

## Demo Preparation
```
✅ Prepare demo accounts:
- admin@demo.com / admin123
- staff@demo.com / staff123  
- user@demo.com / user123

✅ Prepare demo data:
- 5-10 sample complaints
- Various statuses
- Sample images
- Sample announcements

✅ Prepare backup:
- Record video of full demo
- Take screenshots
- Have local version running
- Have production version as backup

✅ Practice:
- Rehearse 3-5 times
- Time each section
- Prepare for questions
- Have backup internet (mobile hotspot)
```

---

# 📝 Documentation Deliverables

## 1. User Manual (20-30 pages)
```
Chapter 1: Introduction
- About the system
- System requirements
- Getting started

Chapter 2: For Reporters
- How to register
- How to submit complaint
- How to track status
- How to use LINE Bot
- FAQs

Chapter 3: For Staff
- How to login
- How to manage assigned complaints
- How to update status
- How to communicate with reporter

Chapter 4: For Administrators
- User management
- Complaint management
- Location/Category setup
- Announcement management
- Reports and analytics
- System settings
```

## 2. Admin Guide (15-20 pages)
```
Chapter 1: Initial Setup
- System installation
- Database setup
- Configuration

Chapter 2: University Registration
- How to register new university
- Configuration checklist
- Branding setup

Chapter 3: User Management
- Creating users
- Assigning roles
- Managing permissions

Chapter 4: System Configuration
- Location setup
- Category setup
- Email settings
- LINE Bot setup

Chapter 5: Maintenance
- Backup procedures
- Monitoring
- Troubleshooting
```

## 3. API Documentation (Swagger/Postman)
```
✅ All endpoints documented
✅ Request/Response examples
✅ Authentication explained
✅ Error codes listed
✅ Postman collection exported
```

## 4. Technical Documentation
```
✅ System architecture diagram
✅ Database schema diagram
✅ Sequence diagrams
✅ Deployment guide
✅ Security considerations
✅ Performance optimization
```

---

# 🎉 Success Metrics

## By End of Phase 1
- [ ] System works for 1 university
- [ ] All core features functional
- [ ] 3 different roles working
- [ ] 10+ test complaints created
- [ ] Dashboard showing real data

## By End of Phase 2
- [ ] 3+ demo universities registered
- [ ] Each has different branding
- [ ] Data completely isolated
- [ ] Template can be exported/imported

## By End of Phase 3
- [ ] LINE Bot responding
- [ ] Announcements posting
- [ ] All notifications working
- [ ] System is production-ready

## Final Success
- [ ] Complete presentation
- [ ] All documentation delivered
- [ ] System deployed online
- [ ] Demo accounts working
- [ ] Team is proud of the work!

---

# 🏆 Project Goals Alignment with SRS

## วัตถุประสงค์เฉพาะ (จาก SRS)

### 1. ระบบให้ผู้ใช้ทุกกลุ่มส่งเรื่องร้องเรียนได้
✅ **Implementation:**
- Public registration
- Role-based access
- Multiple channels (Web + LINE Bot)

### 2. ฟังก์ชันติดตามสถานะและความคืบหน้า
✅ **Implementation:**
- Status timeline in complaint detail
- Email notifications on status change
- LINE notifications
- Real-time updates

### 3. จัดหมวดหมู่และลำดับความสำคัญ
✅ **Implementation:**
- Category system
- Priority levels (low, medium, high, urgent)
- Filter and sort by category/priority
- Auto-assignment based on category

### 4. ระบบแจ้งเตือนและมอบหมายงานอัตโนมัติ
✅ **Implementation:**
- Auto-assignment by category
- Email notifications
- LINE notifications
- Dashboard alerts

### 5. รายงานและสถิติการร้องเรียน
✅ **Implementation:**
- Dashboard with charts
- Export reports (CSV, Excel)
- Analytics by category, location, time
- Staff performance metrics

---

# 🔒 Security Checklist

## Authentication & Authorization
- [x] Passwords hashed with bcrypt (10+ rounds)
- [x] JWT tokens with expiration
- [x] Secure token storage (httpOnly cookies or localStorage with encryption)
- [x] Role-based access control
- [x] Protect admin routes
- [x] Protect API endpoints

## Data Protection
- [x] Input validation on all forms
- [x] Sanitize user inputs
- [x] Prevent SQL injection (using Mongoose)
- [x] Prevent XSS attacks
- [x] CSRF protection
- [x] Tenant data isolation

## File Upload Security
- [x] Validate file types (only images)
- [x] Limit file size (5MB max)
- [x] Sanitize file names
- [x] Store files securely
- [x] Generate unique filenames

## API Security
- [x] Rate limiting
- [x] CORS configuration
- [x] API key for tenant access
- [x] Secure API endpoints
- [x] Error messages don't leak sensitive info

## Production Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Regular backups
- [ ] Monitoring and logging

---

# 📊 Final Submission Checklist

## Code Repositories
- [ ] GitHub repository with all code
- [ ] README.md with setup instructions
- [ ] .gitignore properly configured
- [ ] No sensitive data in repo
- [ ] Clean commit history

## Documentation
- [ ] User Manual (PDF)
- [ ] Admin Guide (PDF)
- [ ] API Documentation (Swagger/Postman)
- [ ] Technical Documentation (PDF)
- [ ] Setup Guide for new universities (PDF)

## Presentation Materials
- [ ] PowerPoint slides (PDF export)
- [ ] Demo video (backup)
- [ ] Screenshots of key features
- [ ] Handouts (optional)

## Deployment
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database hosted and secure
- [ ] Demo accounts working
- [ ] All features functional in production

## Project Report (งานวิจัย)
- [ ] Complete all chapters (1-5)
- [ ] Use Case Diagrams
- [ ] System Architecture Diagrams
- [ ] Database Schema Diagrams
- [ ] Screenshots of system
- [ ] Test results
- [ ] References (บรรณานุกรม)

---

# 🌟 Tips for Excellence

## Code Quality
```javascript
// ❌ Bad
app.get('/c', async (req, res) => {
  const c = await C.find();
  res.json(c);
});

// ✅ Good
app.get('/api/complaints', authenticateUser, async (req, res) => {
  try {
    const complaints = await Complaint.find({ 
      tenant_id: req.tenant._id 
    })
    .populate('reporter_id', 'name email')
    .populate('assigned_to', 'name')
    .sort({ created_at: -1 })
    .limit(20);
    
    res.json({
      success: true,
      data: complaints,
      count: complaints.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
});
```

## UI/UX Excellence
- Use consistent spacing (Tailwind: p-4, m-4, gap-4)
- Use consistent colors (define in theme)
- Add loading states for all async operations
- Add empty states ("No complaints yet")
- Add error states with helpful messages
- Make it mobile-friendly
- Add smooth transitions
- Use icons consistently

## Documentation Excellence
- Write clear, concise instructions
- Add screenshots for every step
- Include code examples
- Explain technical terms
- Add troubleshooting section
- Keep it up-to-date

---

# 🎯 Remember

## The Goal
> Create a **working system** that solves a **real problem** and can be **used by multiple universities**.

## Success Is
- ✅ System works reliably
- ✅ Code is clean and maintainable
- ✅ Documentation is complete
- ✅ Presentation is clear
- ✅ Team worked well together

## Not About
- ❌ Perfect code
- ❌ Every possible feature
- ❌ Latest fancy technology
- ❌ Working alone

## Team Values
- **Communicate** - Ask questions, share progress
- **Collaborate** - Help each other
- **Commit often** - Don't lose work
- **Test early** - Find bugs early
- **Document** - Help others understand
- **Celebrate** - Enjoy the journey!

---

# 📞 Emergency Contacts

## Technical Support
- **MongoDB Issues:** MongoDB Community Forums
- **React Issues:** Stack Overflow
- **LINE Bot Issues:** LINE Developers Community
- **Deployment Issues:** Railway/Vercel/Netlify Support

## Team Contacts
```
Person 1: [Name] - [Phone] - [Email]
Person 2: [Name] - [Phone] - [Email]
Person 3: [Name] - [Phone] - [Email]

Group Chat: [LINE Group Name]
GitHub: [Repository URL]
```

---

# 🎊 Motivation

```
Week 1: "Great start! Foundation is solid."
Week 2: "Core features working! Keep going!"
Week 3: "Template system working! Almost there!"
Week 4: "Final push! You got this!"

Finish Line: "YOU DID IT! 🎉🎉🎉"
```

---

**Good luck team! You got this! 💪🚀**

**Remember:** 
- Take breaks
- Ask for help
- Commit often  
- Test everything
- Have fun!

---

**Last Updated:** 8 October 2025  
**Version:** 2.0 (3-Phase Development Plan)  
**Status:** Ready to Start! 🚀