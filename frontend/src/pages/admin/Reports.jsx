// frontend/src/pages/admin/Reports.jsx
// หน้าแสดงรายงานและสถิติเรื่องร้องเรียนสำหรับผู้ดูแลระบบ
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  FireIcon,
} from "@heroicons/react/24/solid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

/**
 * Reports.jsx
 * - Dashboard สรุปภาพรวมเรื่องร้องเรียน
 * - กราฟและสถิติต่างๆ
 * - ไม่มีตารางรายการ (ย้ายไปหน้า ComplaintListManagement แล้ว)
 */

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.12)",
          padding: "8px 10px",
          borderRadius: 8,
          color: "#000",
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ marginBottom: 4 }}>{`วันที่: ${label}`}</div>
        <div>{`จำนวน: ${payload[0].value} เรื่อง`}</div>
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [complaints, setComplaints] = useState([]);
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const categories = [
    { id: "flood", name: "น้ำท่วม", icon: "💧" },
    { id: "electrical", name: "ไฟฟ้า", icon: "⚡" },
    { id: "computer", name: "คอมพิวเตอร์/เว็บไซต์", icon: "💻" },
    { id: "plumbing", name: "ประปา/ท่อน้ำ", icon: "🚰" },
    { id: "facilities", name: "สิ่งอำนวยความสะดวก", icon: "🏢" },
    { id: "cleanliness", name: "ความสะอาด", icon: "🧹" },
    { id: "safety", name: "ความปลอดภัย", icon: "🚨" },
    { id: "other", name: "อื่นๆ", icon: "📋" },
  ];

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/api/complaints`);
      const json = await res.json();
      const data = json.success ? json.data : json;
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // สรุปจำนวน
  const counts = useMemo(() => {
    const total = complaints.length;
    const waiting = complaints.filter((c) => c.current_status === "รอรับเรื่อง").length;
    const processing = complaints.filter((c) => c.current_status === "กำลังดำเนินการ").length;
    const done = complaints.filter((c) => c.current_status === "เสร็จสิ้น").length;
    const canceled = complaints.filter((c) => c.current_status === "ยกเลิก").length;
    const percentCompleted = total ? Math.round((done / total) * 100) : 0;
    return { total, waiting, processing, done, canceled, percentCompleted };
  }, [complaints]);

  const chartData = [
    { name: "รอรับเรื่อง", count: counts.waiting },
    { name: "กำลังดำเนินการ", count: counts.processing },
    { name: "เสร็จสิ้น", count: counts.done },
    { name: "ยกเลิก", count: counts.canceled },
  ];

  const statusColorsMap = {
    "รอรับเรื่อง": "#FBBF24",
    "กำลังดำเนินการ": "#3B82F6",
    "เสร็จสิ้น": "#10B981",
    "ยกเลิก": "#d63939ff",
  };

  const chartDataFiltered = chartData.filter((d) => d.count > 0);

  // แนวโน้มรายวัน
  const trendData = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      const d = new Date(c.datetime_reported);
      if (isNaN(d)) return;
      const date = d.toLocaleDateString("th-TH");
      map[date] = (map[date] || 0) + 1;
    });
    const arr = Object.keys(map)
      .map((k) => ({ date: k, count: map[k] }))
      .sort((a, b) => {
        const da = new Date(a.date);
        const db = new Date(b.date);
        return da - db;
      });
    return arr;
  }, [complaints]);

  // หมวดหมู่ยอดนิยม
  const categoryStats = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      (c.categories || []).forEach((cat) => {
        map[cat] = (map[cat] || 0) + 1;
      });
    });

    return Object.keys(map).map((key) => {
      const match = categories.find((c) => c.id === key);
      return {
        name: match ? match.name : key,
        value: map[key],
      };
    });
  }, [complaints, categories]);

  const categoryColors = [
    "#FF6B6B", "#4ECDC4", "#FFD93D", "#1A535C", 
    "#FF9F1C", "#6A4C93", "#00A896", "#F15BB5", 
    "#2E8BFF", "#8BDBE6"
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen" style={{ color: "#000" }}>
      <h1 className="text-3xl font-extrabold text-center mb-8 text-[#55C388] drop-shadow-md">
        รายงานและสถิติเรื่องร้องเรียน
      </h1>

      {/* สรุป (cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          {
            title: "ทั้งหมด",
            value: counts.total,
            subtitle: "รวมเหตุการณ์ทั้งหมด",
            color: "from-[#55C388] to-[#43A874]",
            icon: <ClipboardDocumentListIcon className="h-10 w-10 text-white" />,
          },
          {
            title: "เสร็จสิ้น",
            value: counts.done,
            subtitle: `${counts.percentCompleted}% ของทั้งหมด`,
            color: "from-green-500 to-green-600",
            icon: <CheckCircleIcon className="h-10 w-10 text-white" />,
          },
          {
            title: "รอรับเรื่อง",
            value: counts.waiting,
            subtitle: "รอการตอบรับ / ดำเนินการ",
            color: "from-yellow-400 to-yellow-500",
            icon: <ClockIcon className="h-10 w-10 text-white" />,
          },
          {
            title: "กำลังดำเนินการ",
            value: counts.processing,
            subtitle: "อยู่ระหว่างแก้ไขปัญหา",
            color: "from-blue-400 to-blue-600",
            icon: <Cog6ToothIcon className="h-10 w-10 text-white animate-spin-slow" />,
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`rounded-xl bg-gradient-to-br ${card.color} p-4 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white text-xs opacity-80">{card.subtitle}</p>
                <h2 className="text-2xl font-bold text-white mt-1">{card.value}</h2>
              </div>
              <div className="bg-white/20 p-2 rounded-full">{card.icon}</div>
            </div>
            <p className="mt-2 text-white text-base font-semibold">{card.title}</p>
          </div>
        ))}
      </div>

      {/* กราฟหลัก (Bar & Pie) */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Bar: จำนวนเรื่องร้องเรียนแต่ละสถานะ */}
        <div className="bg-white p-4 rounded-xl shadow border border-green-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-[#55C388]" />
            จำนวนเรื่องร้องเรียนแต่ละสถานะ
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#000" tick={{ fill: "#000" }} />
              <YAxis stroke="#000" tick={{ fill: "#000" }} allowDecimals={false} />
              <Tooltip contentStyle={{ color: "#000" }} />
              <Bar dataKey="count">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={statusColorsMap[entry.name] || "#ccc"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie: สัดส่วนสถานะ */}
        <div className="bg-white p-4 rounded-xl shadow border border-green-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChartPieIcon className="h-5 w-5 text-[#55C388]" />
            สัดส่วนสถานะเรื่องร้องเรียน
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartDataFiltered}
                dataKey="count"
                nameKey="name"
                outerRadius={80}
                label={(entry) => `${entry.name} (${entry.count})`}
                labelLine={{ stroke: '#666', strokeWidth: 1 }}
                paddingAngle={2}
              >
                {chartDataFiltered.map((entry, i) => (
                  <Cell key={i} fill={statusColorsMap[entry.name] || "#ccc"} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ color: "#000" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics: แนวโน้มรายวัน + หมวดหมู่ยอดนิยม */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* แนวโน้มรายวัน */}
        <div className="bg-white p-4 rounded-xl shadow border border-green-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <PresentationChartLineIcon className="h-5 w-5 text-[#55C388]" />
            แนวโน้มจำนวนเรื่องร้องเรียนรายวัน
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#000" tick={{ fill: "#000" }} />
              <YAxis stroke="#000" tick={{ fill: "#000" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#55C388"
                strokeWidth={3}
                dot={{ r: 5, fill: "#55C388", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* หมวดหมู่ยอดนิยม */}
        <div className="bg-white p-4 rounded-xl shadow border border-green-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-[#  ]" /> หมวดหมู่ที่ถูกร้องเรียนมากที่สุด
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryStats}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label={(entry) => `${entry.name} (${entry.value})`}
              >
                {categoryStats.map((_, i) => (
                  <Cell key={i} fill={categoryColors[i % categoryColors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ color: "#000" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ข้อความแจ้งเตือน */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <p className="text-gray-700">
          💡 ต้องการดูรายละเอียดหรือจัดการเรื่องร้องเรียน? ไปที่เมนู <strong>Complaint List</strong> หรือ <strong>Staff Performance</strong>
        </p>
      </div>
    </div>
  );
}