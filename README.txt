# ข้อมูลเกี่ยวกับโปรเจค
ues nvm  --> v22.20.0 || nvm install iron

# โครงสร้างโปรเจค
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

# แหล่งอ้างอิงโปรเจค
# ใช้บ่อย
Npm Docs https://www.npmjs.com 

# ux/ui
daisyUI Tailwind Components https://daisyui.com/
Tailwind CSS (v4.1) https://tailwindcss.com 
Tailwind CSS Components - Tailwind Plus https://tailwindcss.com/plus/ui-blocks
React Icons https://react-icons.github.io/react-icons 

# ใช้บ้างจุบจิบ
Vite Official Documentation. https://vite.dev/guide
React Official Documentation. https://react.dev
Node.js Official Documentation. https://nodejs.org 
Express.js Guide. https://expressjs.com
Git Cheat Sheet https://git-scm.com/cheat-sheet 
MySQL Documentation https://dev.mysql.com/doc 
Nuxt UI: The Intuitive Vue UI Library https://ui.nuxt.com/
W3Schools Online Web Tutorials https://www.w3schools.com 
Mozilla Developer Network (MDN). Web Storage API. https://developer.mozilla.org