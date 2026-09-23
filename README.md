# MyUsafe Report Project

ระบบรับเรื่องร้องเรียนด้านสถานที่ในสถาบันอุดมศึกษา (Complaint System for Higher Education Institutions)
รายวิชา CSI400 - Web Services, มหาวิทยาลัยศรีปทุม

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | React + Vite, Tailwind CSS, daisyUI, React Router, Recharts |
| Backend | Node.js, Express, JWT, Multer, Bcrypt |
| Database | MongoDB + Mongoose |
| Testing | Mocha, Chai, Supertest |

## Prerequisites

- Node.js v22.20.0 (แนะนำให้ใช้ [nvm](https://github.com/nvm-sh/nvm))
- MongoDB

```bash
nvm install 22.20.0
nvm use 22.20.0
```

## Quick Start

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (terminal อีกหน้าต่าง)
cd frontend
npm install
npm run dev
```

รายละเอียดเพิ่มเติม: [backend/README.md](backend/README.md) · [frontend/README.md](frontend/README.md)

## Project Structure

```text
MyUsafe-ReportProject/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── scripts/      # seed scripts
│   ├── tests/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── PROJECT_PLAN.md       # แผนงานและการแบ่งหน้าที่ของทีม
└── README.md
```

## Documentation

- [แผนงานโปรเจกต์ (Project Plan)](PROJECT_PLAN.md)
- [Backend & API](backend/README.md)
- [Frontend](frontend/README.md)

## References

**ใช้บ่อย**
- [npm Docs](https://www.npmjs.com)

**UX/UI**
- [daisyUI](https://daisyui.com/)
- [Tailwind CSS](https://tailwindcss.com)
- [Tailwind Plus UI Blocks](https://tailwindcss.com/plus/ui-blocks)
- [React Icons](https://react-icons.github.io/react-icons)

**อื่น ๆ**
- [Vite](https://vite.dev/guide) · [React](https://react.dev) · [Node.js](https://nodejs.org) · [Express](https://expressjs.com)
- [Git Cheat Sheet](https://git-scm.com/cheat-sheet)
- [MDN Web Storage API](https://developer.mozilla.org)
