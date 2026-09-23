# Frontend

React + Vite สำหรับระบบรับเรื่องร้องเรียน

## Installation

```bash
cd frontend
npm install
```

แพ็กเกจเพิ่มเติมที่ใช้ในโปรเจกต์:

```bash
# UI / Routing / Animation
npm install tailwindcss@latest @tailwindcss/vite@latest daisyui@latest \
  react-router-dom @headlessui/react @heroicons/react lucide-react framer-motion

# Realtime
npm install socket.io-client socket.io

# Export / Charts
npm install xlsx file-saver recharts
```

## Scripts

| คำสั่ง | หน้าที่ |
|--------|---------|
| `npm run dev` | เริ่ม dev server |
| `npm run build` | build สำหรับ production |
| `npm run preview` | ดูผล build |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |

## Usage: ComplaintList

ตัวอย่างการใช้ `ComplaintList` ในหน้า Home

```jsx
import ComplaintList from '../components/complaints/ComplaintList';

const [complaints, setComplaints] = useState([]);
const [loading, setLoading] = useState(true);

<ComplaintList
  complaints={complaints}
  loading={loading}
  showFilters={true}
/>
```
