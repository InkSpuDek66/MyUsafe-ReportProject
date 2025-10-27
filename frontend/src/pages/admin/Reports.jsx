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
  FunnelIcon,
  ArrowPathIcon,
  PresentationChartLineIcon,
  FireIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
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
import * as XLSX from "xlsx";

/**
 * Reports.jsx
 * - Tooltip ของแนวโน้มรายวันเป็นตัวอักษรสีดำ (CustomTooltip)
 * - Pie chart หมวดหมู่ใช้สีไม่ซ้ำ
 * - ตารางมีฟิลเตอร์ + ปุ่มดาวน์โหลด CSV/XLSX
 * - ตาราง: ปุ่มเปลี่ยนสถานะตามเงื่อนไข:
 *    รอรับเรื่อง -> [กำลังดำเนินการ, ยกเลิก]
 *    กำลังดำเนินการ -> [เสร็จสิ้น, ยกเลิก]
 *    เสร็จสิ้น / ยกเลิก -> ไม่มีปุ่ม
 *
 * หมายเหตุ: endpoint เปลี่ยนสถานะจะเรียก PATCH `${API}/api/complaints/${id}/status`
 * โดยส่ง body { status: "newStatus", updated_by: "Admin001" }
 */

// Custom tooltip ที่บังคับสีตัวอักษรเป็นดำเสมอ
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
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [staffList, setStaffList] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const categories = [
    { id: "flood", name: "น้ำท่วม", icon: "💧" },
    { id: "electrical", name: "ไฟฟ้า", icon: "⚡" },
    { id: "computer", name: "คอมพิวเตอร์/เว็บไซต์", icon: "💻" },
    { id: "plumbing", name: "ประปา/ท่อน้ำ", icon: "🚰" },
    { id: "facilities", name: "สิ่งอำนวยความสะดวก", icon: "🏢" },
    { id: "cleanliness", name: "ความสะอาด", icon: "🧹" },
    { id: "safety", name: "ความปลอดภัย", icon: "🚨" },
    { id: "other", name: "อื่นๆ", icon: "📝" },
  ];

  // โหลดข้อมูล
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

  // เพิ่มในฟังก์ชัน loadData หรือสร้าง useEffect ใหม่
  useEffect(() => {
    loadData();
    loadStaffList(); // ✅ เพิ่มบรรทัดนี้
  }, []);

  const loadStaffList = async () => {
    try {
      const res = await fetch(`${API}/api/assignments/staff`);
      const json = await res.json();
      if (json.success) {
        setStaffList(json.data);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ฟิลเตอร์ + ค้นหา
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        if (filterStatus !== "ทั้งหมด" && c.current_status !== filterStatus)
          return false;
        if (selectedCategories.length > 0) {
          const cates = Array.isArray(c.categories) ? c.categories : [];
          if (!selectedCategories.some((id) => cates.includes(id))) return false;
        }
        if (searchQuery && searchQuery.trim() !== "") {
          const q = searchQuery.trim().toLowerCase();
          const inTitle = (c.title || "").toLowerCase().includes(q);
          const inId = (c.complaint_id || "").toLowerCase().includes(q);
          const inCategory = (c.categories || []).join(" ").toLowerCase().includes(q);
          return inTitle || inId || inCategory;
        }
        return true;
      })
      .sort((a, b) => new Date(b.datetime_reported) - new Date(a.datetime_reported));
  }, [complaints, filterStatus, selectedCategories, searchQuery]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = itemsPerPage === -1
    ? filteredComplaints
    : filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = itemsPerPage === -1
    ? 1
    : Math.ceil(filteredComplaints.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, selectedCategories, searchQuery]);

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
  // กรองเอาเฉพาะสถานะที่มีข้อมูล (count > 0) สำหรับ pie chart
  const chartDataFiltered = chartData.filter((d) => d.count > 0);
  const statusBadgeClass = (s) => {
    // แสดงพื้นหลังอ่อนตามสถานะ แต่ข้อความเป็นดำ (override)
    if (s === "รอรับเรื่อง") return "bg-yellow-100 text-black";
    if (s === "กำลังดำเนินการ") return "bg-blue-100 text-black";
    if (s === "เสร็จสิ้น") return "bg-green-100 text-black";
    if (s === "ยกเลิก") return "bg-gray-200 text-black";
    return "bg-gray-100 text-black";
  };

  // แนวโน้มรายวัน
  const trendData = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      const d = new Date(c.datetime_reported);
      if (isNaN(d)) return;
      // ใช้รูปแบบวันที่แบบไทย
      const date = d.toLocaleDateString("th-TH");
      map[date] = (map[date] || 0) + 1;
    });
    // แปลงเป็น array เรียงจากต้น -> ปลาย (เพื่อให้กราฟไล่ตามเวลา)
    const arr = Object.keys(map)
      .map((k) => ({ date: k, count: map[k] }))
      .sort((a, b) => {
        // แปลงกลับเป็น Date เพื่อเรียง
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
        name: match ? match.name : key, // ✅ ถ้ามี name ใช้ชื่อไทย, ถ้าไม่มีก็ใช้ id เดิม
        value: map[key],
      };
    });
  }, [complaints, categories]);


  // สีหมวดหมู่ไม่ซ้ำ
  const categoryColors = [
    "#FF6B6B", // แดง
    "#4ECDC4", // เขียวฟ้า
    "#FFD93D", // เหลือง
    "#1A535C", // เขียวน้ำเงินเข้ม
    "#FF9F1C", // ส้ม
    "#6A4C93", // ม่วง
    "#00A896", // เขียวมิ้นต์
    "#F15BB5", // ชมพู
    "#2E8BFF", // น้ำเงิน
    "#8BDBE6", // ฟ้าอ่อน
  ];

  // เปลี่ยนสถานะ (เรียก API) — ใช้ PATCH /api/complaints/:id/status { status, updated_by }
  const handleStatusChange = async (id, newStatus) => {
    if (!confirm(`ยืนยันเปลี่ยนสถานะเป็น "${newStatus}" ?`)) return;
    try {
      const res = await fetch(`${API}/api/complaints/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          updated_by: "Admin001",
        }),
      });

      if (res.ok) {
        // reload data
        await loadData();
        alert("เปลี่ยนสถานะเรียบร้อยแล้ว");
      } else {
        const txt = await res.text();
        console.error("Failed to change status:", txt);
        alert("เปลี่ยนสถานะไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Error changing status:", err);
      alert("เกิดข้อผิดพลาดระหว่างเปลี่ยนสถานะ");
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    try {
      const res = await fetch(`${API}/api/complaints/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priority: newPriority,
          updated_by: "Admin001",
        }),
      });

      if (res.ok) {
        await loadData();
        alert("อัปเดตความสำคัญเรียบร้อยแล้ว");
      } else {
        const errText = await res.text();
        console.error("Priority update failed:", errText);
        alert("อัปเดตไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Error updating priority:", err);
      alert("เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  // Staff list สำหรับมอบหมายงาน
  const handleAssign = async () => {
    if (!selectedStaffId) {
      alert('กรุณาเลือกเจ้าหน้าที่');
      return;
    }

    try {
      const res = await fetch(`${API}/api/assignments/${selectedComplaintId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_to: selectedStaffId,
          assigned_by: 'Admin001' // TODO: ใช้ user_id จริงจาก auth
        })
      });

      if (res.ok) {
        await loadData();
        setShowAssignModal(false);
        setSelectedComplaintId(null);
        setSelectedStaffId('');
        alert('มอบหมายงานสำเร็จ');
      } else {
        alert('มอบหมายงานไม่สำเร็จ');
      }
    } catch (err) {
      console.error('Error assigning:', err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  // Export CSV / XLSX
  const exportData = (type) => {
    const dataToExport = filteredComplaints.map((c) => ({
      ID: c.complaint_id,
      หัวข้อ: c.title,
      หมวดหมู่: (c.categories || []).join(", "),
      สถานะ: c.current_status,
      วันที่แจ้ง: new Date(c.datetime_reported).toLocaleString("th-TH"),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Complaints");

    if (type === "csv") {
      XLSX.writeFile(wb, "complaints_report.csv", { bookType: "csv" });
    } else {
      XLSX.writeFile(wb, "complaints_report.xlsx");
    }
  };

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
                data={chartDataFiltered}  // ✅ เปลี่ยนจาก chartData
                dataKey="count"
                nameKey="name"
                outerRadius={80}
                label={(entry) => `${entry.name} (${entry.count})`}
                labelLine={{ stroke: '#666', strokeWidth: 1 }}  // ✅ เพิ่มเส้นโยงที่ชัดเจน
                paddingAngle={2}  // ✅ เพิ่มระยะห่างระหว่างชิ้น
              >
                {chartDataFiltered.map((entry, i) => (  // ✅ เปลี่ยนเป็น chartDataFiltered
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
            <FireIcon className="h-5 w-5 text-[#55C388]" /> หมวดหมู่ที่ถูกร้องเรียนมากที่สุด
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

      {/* Filter + Export + Table */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {["ทั้งหมด", "รอรับเรื่อง", "กำลังดำเนินการ", "เสร็จสิ้น", "ยกเลิก"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${filterStatus === s
                  ? "bg-[#55C388] text-white border-[#55C388]"
                  : "border-[#55C388] text-[#55C388] hover:bg-[#55C388]/10"
                }`}
            >
              {s}
            </button>
          ))}

          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-[#55C388] text-white rounded-lg shadow hover:bg-[#43A874] transition"
          >
            <FunnelIcon className="h-5 w-5" /> หมวดหมู่
          </button>

          <button
            onClick={() => {
              setFilterStatus("ทั้งหมด");
              setSelectedCategories([]);
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] transition flex items-center gap-1"
          >
            <ArrowPathIcon className="h-4 w-4" /> รีเซ็ต
          </button>

          {/* Search box */}
          <div className="ml-auto flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา ID/หัวข้อ/หมวดหมู่"
              className="px-3 py-2 border rounded-lg text-sm"
              style={{ color: "#55C388" }}
            />
          </div>
        </div>
        {/* หมวดหมู่เลือกแบบป๊อปอัพ */}
        {showCategoryMenu && (
          <div className="flex flex-wrap justify-center gap-3 mb-6 bg-white border border-green-200 rounded-2xl p-4 shadow-md">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all ${selectedCategories.includes(cat.id)
                    ? "bg-[#55C388] text-white border-[#55C388]"
                    : "border-[#55C388] text-[#55C388] hover:bg-[#55C388]/10"
                  }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center gap-3">
          {/* Dropdown แสดงจำนวนต่อหน้า */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 ">แสดง</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#55C388] text-[#55C388]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>ทั้งหมด</option>
            </select>
            <span className="text-sm text-gray-600">รายการ</span>
          </div>

          {/* ปุ่มดาวน์โหลด */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => exportData("csv")}
              className="flex items-center gap-2 px-3 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874]"
            >
              <ArrowDownTrayIcon className="h-5 w-5" /> CSV
            </button>
            <button
              onClick={() => exportData("xlsx")}
              className="flex items-center gap-2 px-3 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874]"
            >
              <ArrowDownTrayIcon className="h-5 w-5" /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border border-green-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#55C388]">รายการเรื่องร้องเรียน</h2>
          <div className="text-sm text-gray-600">ทั้งหมด {filteredComplaints.length} รายการ</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse" style={{ color: "#000" }}>
            <thead className="bg-green-50 border-b border-green-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">หัวข้อ</th>
                <th className="px-4 py-2">หมวดหมู่</th> {/* เก็บไว้ */}
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2">วันที่แจ้ง</th>
                <th className="px-4 py-2">จัดการ</th>
                <th className="px-4 py-2">ความสำคัญ</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((c) => (
                <tr key={c.complaint_id} className="border-b hover:bg-green-50 transition">
                  <td className="px-4 py-2 align-top">{c.complaint_id}</td>
                  <td className="px-4 py-2 align-top font-medium">{c.title}</td>

                  {/* ✅ คอลัมน์หมวดหมู่ */}
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-wrap gap-1">
                      {(c.categories || []).map((cat, i) => {
                        // ✅ เพิ่มการแปลง id เป็นชื่อไทย
                        const categoryInfo = categories.find(category => category.id === cat);
                        const displayName = categoryInfo ? categoryInfo.name : cat;

                        return (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              background: "#F0FDF4",
                              color: "#064E3B",
                              border: "1px solid rgba(0,0,0,0.04)",
                            }}
                          >
                            {displayName}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* คอลัมน์สถานะ */}
                  <td className="px-4 py-2 align-top">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(
                        c.current_status
                      )}`}
                      style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      {c.current_status}
                    </span>
                  </td>

                  {/* คอลัมน์วันที่แจ้ง */}
                  <td className="px-4 py-2 align-top">
                    <div style={{ color: "#000" }}>
                      {new Date(c.datetime_reported).toLocaleString("th-TH")}
                    </div>
                  </td>

                  {/* ✅ คอลัมน์จัดการ - ใช้โค้ดด้านบน */}
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col gap-2">
                      {/* ใช้โค้ดจากข้อ 1 ด้านบน */}
                      {!c.assigned_to && c.current_status !== 'เสร็จสิ้น' && c.current_status !== 'ยกเลิก' && (
                        <button
                          onClick={() => {
                            setSelectedComplaintId(c.complaint_id);
                            setShowAssignModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#55C388] text-white rounded-md text-sm hover:bg-[#43A874] flex items-center gap-1 justify-center"
                        >
                          <UserGroupIcon className="h-4 w-4" />
                          มอบหมาย
                        </button>
                      )}

                      {c.current_status !== 'เสร็จสิ้น' && c.current_status !== 'ยกเลิก' && (
                        <button
                          onClick={() => handleStatusChange(c.complaint_id, "ยกเลิก")}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                        >
                          ยกเลิก
                        </button>
                      )}

                      {c.assigned_to && c.current_status !== 'เสร็จสิ้น' && c.current_status !== 'ยกเลิก' && (
                        <div className="text-xs text-gray-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                          <UserGroupIcon className="h-3 w-3 text-blue-600" />
                          <span className="text-blue-600 font-medium">มอบหมายแล้ว</span>
                        </div>
                      )}

                      {(c.current_status === "เสร็จสิ้น" || c.current_status === "ยกเลิก") && (
                        <div className="text-sm text-gray-500 italic">-</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <select
                      value={c.priority || "low"}
                      onChange={(e) => handlePriorityChange(c.complaint_id, e.target.value)}
                      className="border border-green-200 rounded-lg px-2 py-1 text-sm text-[#55C388]"
                    >
                      <option value="low">ต่ำ</option>
                      <option value="medium">ปานกลาง</option>
                      <option value="high">สูง</option>
                      <option value="urgent">ด่วนมาก</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {itemsPerPage !== -1 && totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-green-100">
            <div className="text-sm text-gray-600">
              แสดง {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredComplaints.length)} จาก {filteredComplaints.length} รายการ
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#55C388] text-white hover:bg-[#43A874]'
                  }`}
              >
                ก่อนหน้า
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-lg text-sm ${currentPage === i + 1
                        ? 'bg-[#55C388] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#55C388] text-white hover:bg-[#43A874]'
                  }`}
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
      {/* ✅ Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserGroupIcon className="h-6 w-6 text-[#55C388]" />
              เลือกเจ้าหน้าที่
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เจ้าหน้าที่
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:outline-none"
              >
                <option value="">-- เลือกเจ้าหน้าที่ --</option>
                {staffList.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAssign}
                className="flex-1 px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] font-medium"
              >
                ยืนยัน
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedComplaintId(null);
                  setSelectedStaffId('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
