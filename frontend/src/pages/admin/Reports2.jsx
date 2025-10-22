import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ChartPieIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
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
  CartesianGrid,
} from "recharts";
import * as XLSX from "xlsx";

export default function Reports() {
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (filterStatus !== "ทั้งหมด" && c.current_status !== filterStatus)
        return false;
      if (selectedCategories.length > 0) {
        const cates = Array.isArray(c.categories) ? c.categories : [];
        if (!selectedCategories.some((id) => cates.includes(id))) return false;
      }
      return true;
    });
  }, [complaints, filterStatus, selectedCategories]);

  const counts = useMemo(() => {
    const total = complaints.length;
    const waiting = complaints.filter((c) => c.current_status === "รอรับเรื่อง").length;
    const processing = complaints.filter((c) => c.current_status === "กำลังดำเนินการ").length;
    const done = complaints.filter((c) => c.current_status === "เสร็จสิ้น").length;
    const percentCompleted = total ? Math.round((done / total) * 100) : 0;
    return { total, waiting, processing, done, percentCompleted };
  }, [complaints]);

  const chartData = [
    { name: "รอรับเรื่อง", count: counts.waiting },
    { name: "กำลังดำเนินการ", count: counts.processing },
    { name: "เสร็จสิ้น", count: counts.done },
  ];

  const colors = {
    รอรับเรื่อง: "#FBBF24",
    กำลังดำเนินการ: "#3B82F6",
    เสร็จสิ้น: "#10B981",
  };

  const staffPerformance = [
    { name: "เจ้าหน้าที่เอ", assigned: 12, resolved: 10, avgTime: 5 },
    { name: "เจ้าหน้าที่บี", assigned: 9, resolved: 7, avgTime: 8 },
    { name: "เจ้าหน้าที่ซี", assigned: 7, resolved: 5, avgTime: 10 },
    { name: "เจ้าหน้าที่ดี", assigned: 5, resolved: 5, avgTime: 4 },
  ];

  const statusColor = (s) => {
    if (s === "รอรับเรื่อง") return "bg-red-100 text-red-800";
    if (s === "กำลังดำเนินการ") return "bg-yellow-100 text-yellow-800";
    if (s === "เสร็จสิ้น") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-700";
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredComplaints);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "complaints_report.xlsx");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-[#55C388] drop-shadow-md">
        รายงานและสถิติเรื่องร้องเรียน
      </h1>

      {/* ✅ Filter */}
      <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
        <FunnelIcon className="h-6 w-6 text-[#55C388]" />
        {["ทั้งหมด", "รอรับเรื่อง", "กำลังดำเนินการ", "เสร็จสิ้น"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
              filterStatus === s
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
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <DocumentArrowDownIcon className="h-5 w-5" /> Export Excel
        </button>
      </div>

      {showCategoryMenu && (
        <div className="flex flex-wrap justify-center gap-3 mb-6 bg-white border border-green-200 rounded-2xl p-4 shadow-md">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all ${
                selectedCategories.includes(cat.id)
                  ? "bg-[#55C388] text-white border-[#55C388]"
                  : "border-[#55C388] text-[#55C388] hover:bg-[#55C388]/10"
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ✅ Summary Cards */}
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

      {/* ✅ Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-4 rounded-xl shadow border border-green-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-[#55C388]" /> จำนวนเรื่องร้องเรียนแต่ละสถานะ
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={colors[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-green-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChartPieIcon className="h-5 w-5 text-[#55C388]" /> สัดส่วนสถานะเรื่องร้องเรียน
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                outerRadius={80}
                label
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={colors[entry.name]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ ตารางรายการเรื่องร้องเรียน */}
      <div className="bg-white rounded-2xl shadow border border-green-100 p-6">
        <h2 className="text-xl font-bold text-[#55C388] mb-4">
          รายการเรื่องร้องเรียน
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-green-50 border-b border-green-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">หัวข้อ</th>
                <th className="px-4 py-2">หมวดหมู่</th>
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2">วันที่แจ้ง</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c.complaint_id} className="border-b hover:bg-green-50 transition">
                  <td className="px-4 py-2">{c.complaint_id}</td>
                  <td className="px-4 py-2 font-medium text-gray-700">{c.title}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(c.categories || []).map((cat, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(c.current_status)}`}>
                      {c.current_status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(c.datetime_reported).toLocaleString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Staff Performance Metrics */}
      <div className="bg-white rounded-2xl shadow border border-green-100 p-6 mt-10">
        <h2 className="text-xl font-bold text-[#55C388] mb-4 flex items-center gap-2">
          <UserGroupIcon className="h-6 w-6 text-[#55C388]" /> สถิติการทำงานของเจ้าหน้าที่
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={staffPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="assigned" fill="#60A5FA" name="รับเรื่องทั้งหมด" />
            <Bar dataKey="resolved" fill="#10B981" name="แก้ไขสำเร็จ" />
            <Bar dataKey="avgTime" fill="#FBBF24" name="เวลาเฉลี่ย (ชม.)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
