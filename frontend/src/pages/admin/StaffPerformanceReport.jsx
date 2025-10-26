import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  FireIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  TrophyIcon,
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
        <div style={{ marginBottom: 4 }}>{`${label}`}</div>
        <div>{`จำนวน: ${payload[0].value} เรื่อง`}</div>
      </div>
    );
  }
  return null;
};

export default function StaffPerformanceReports() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    loadData();
    loadStaffList();
  }, []);

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

  // สรุปจำนวนเรื่องทั้งหมด
  const counts = useMemo(() => {
    const total = complaints.length;
    const waiting = complaints.filter((c) => c.current_status === "รอรับเรื่อง").length;
    const processing = complaints.filter((c) => c.current_status === "กำลังดำเนินการ").length;
    const done = complaints.filter((c) => c.current_status === "เสร็จสิ้น").length;
    const canceled = complaints.filter((c) => c.current_status === "ยกเลิก").length;
    const percentCompleted = total ? Math.round((done / total) * 100) : 0;
    return { total, waiting, processing, done, canceled, percentCompleted };
  }, [complaints]);

  // สถิติการทำงานของเจ้าหน้าที่แต่ละคน
  const staffPerformance = useMemo(() => {
    const staffMap = {};

    complaints.forEach((c) => {
      if (!c.assigned_to) return;

      if (!staffMap[c.assigned_to]) {
        const staff = staffList.find(s => s._id === c.assigned_to);
        staffMap[c.assigned_to] = {
          id: c.assigned_to,
          name: staff ? staff.name : c.assigned_to,
          email: staff ? staff.email : '',
          total: 0,
          completed: 0,
          processing: 0,
          avgTime: 0,
          totalTime: 0,
        };
      }

      staffMap[c.assigned_to].total++;

      if (c.current_status === "เสร็จสิ้น") {
        staffMap[c.assigned_to].completed++;
        
        // คำนวณเวลาที่ใช้ (วัน)
        if (c.completed_date && c.completed_date !== '-') {
          const completedDate = new Date(c.completed_date);
          const reportedDate = new Date(c.datetime_reported);
          const diffDays = Math.floor((completedDate - reportedDate) / (1000 * 60 * 60 * 24));
          staffMap[c.assigned_to].totalTime += diffDays;
        }
      } else if (c.current_status === "กำลังดำเนินการ") {
        staffMap[c.assigned_to].processing++;
      }
    });

    // คำนวณเวลาเฉลี่ย
    Object.values(staffMap).forEach(staff => {
      if (staff.completed > 0) {
        staff.avgTime = Math.round(staff.totalTime / staff.completed);
      }
    });

    return Object.values(staffMap).sort((a, b) => b.completed - a.completed);
  }, [complaints, staffList]);

  // กราฟแท่ง: จำนวนเรื่องที่เสร็จสิ้นของแต่ละคน
  const staffCompletionChart = staffPerformance.map(s => ({
    name: s.name.split(' ')[0], // ใช้ชื่อแรก
    completed: s.completed,
    processing: s.processing,
  }));

  // Pie Chart: สัดส่วนการทำงานของแต่ละคน
  const staffWorkloadChart = staffPerformance
    .filter(s => s.total > 0)
    .map(s => ({
      name: s.name.split(' ')[0],
      value: s.total,
    }));

  const staffColors = [
    "#FF6B6B", "#4ECDC4", "#FFD93D", "#1A535C", 
    "#FF9F1C", "#6A4C93", "#00A896", "#F15BB5", 
    "#2E8BFF", "#8BDBE6"
  ];

  // Top Performers
  const topPerformers = [...staffPerformance]
    .sort((a, b) => {
      const aRate = a.total > 0 ? (a.completed / a.total) * 100 : 0;
      const bRate = b.total > 0 ? (b.completed / b.total) * 100 : 0;
      return bRate - aRate;
    })
    .slice(0, 5);

  // Export to Excel
  const exportStaffReport = () => {
    const data = staffPerformance.map((s) => ({
      ชื่อเจ้าหน้าที่: s.name,
      อีเมล: s.email,
      'รับมอบหมายทั้งหมด': s.total,
      'เสร็จสิ้น': s.completed,
      'กำลังดำเนินการ': s.processing,
      'อัตราความสำเร็จ (%)': s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
      'เวลาเฉลี่ย (วัน)': s.avgTime,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff Performance");
    XLSX.writeFile(wb, "staff_performance_report.xlsx");
  };

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

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen" style={{ color: "#000" }}>
      <h1 className="text-3xl font-extrabold text-center mb-8 text-[#55C388] drop-shadow-md">
        รายงานผลการปฏิบัติงานของเจ้าหน้าที่
      </h1>

      {/* สรุปภาพรวม */}
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

      {/* Top Performers */}
      <div className="bg-white p-6 rounded-xl shadow border border-green-100 mb-10">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-lg">
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
          Top 5 เจ้าหน้าที่ที่มีผลงานดีเด่น
        </h3>
        <div className="space-y-3">
          {topPerformers.map((staff, index) => {
            const successRate = staff.total > 0 ? Math.round((staff.completed / staff.total) * 100) : 0;
            return (
              <div key={staff.id} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 'bg-[#55C388]'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{staff.name}</div>
                  <div className="text-sm text-gray-600">{staff.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{staff.completed} เรื่อง</div>
                  <div className="text-sm text-gray-600">อัตราสำเร็จ {successRate}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* กราฟหลัก */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* กราฟแท่ง: จำนวนเรื่องที่เสร็จสิ้นของแต่ละคน */}
        <div className="bg-white p-4 rounded-xl shadow border border-green-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-[#55C388]" />
            จำนวนเรื่องที่จัดการของแต่ละคน
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={staffCompletionChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#000" tick={{ fill: "#000" }} />
              <YAxis stroke="#000" tick={{ fill: "#000" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="completed" name="เสร็จสิ้น" fill="#10B981" />
              <Bar dataKey="processing" name="กำลังดำเนินการ" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: สัดส่วนการทำงาน */}
        <div className="bg-white p-4 rounded-xl shadow border border-green-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChartPieIcon className="h-5 w-5 text-[#55C388]" />
            สัดส่วนงานที่รับมอบหมาย
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={staffWorkloadChart}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name} (${entry.value})`}
                labelLine={{ stroke: '#666', strokeWidth: 1 }}
                paddingAngle={2}
              >
                {staffWorkloadChart.map((_, index) => (
                  <Cell key={index} fill={staffColors[index % staffColors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ตารางสรุปผลการทำงาน */}
      <div className="bg-white rounded-2xl shadow border border-green-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#55C388]">สรุปผลการทำงานของเจ้าหน้าที่</h2>
          <button
            onClick={exportStaffReport}
            className="flex items-center gap-2 px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874]"
          >
            <ArrowDownTrayIcon className="h-5 w-5" /> Export Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-green-50 border-b border-green-100">
              <tr>
                <th className="px-4 py-3">ชื่อเจ้าหน้าที่</th>
                <th className="px-4 py-3">อีเมล</th>
                <th className="px-4 py-3 text-center">รับมอบหมาย</th>
                <th className="px-4 py-3 text-center">เสร็จสิ้น</th>
                <th className="px-4 py-3 text-center">กำลังดำเนินการ</th>
                <th className="px-4 py-3 text-center">อัตราสำเร็จ</th>
                <th className="px-4 py-3 text-center">เวลาเฉลี่ย (วัน)</th>
              </tr>
            </thead>
            <tbody>
              {staffPerformance.map((staff) => {
                const successRate = staff.total > 0 ? Math.round((staff.completed / staff.total) * 100) : 0;
                return (
                  <tr key={staff.id} className="border-b hover:bg-green-50 transition">
                    <td className="px-4 py-3 font-medium">{staff.name}</td>
                    <td className="px-4 py-3 text-gray-600">{staff.email}</td>
                    <td className="px-4 py-3 text-center font-semibold">{staff.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                        {staff.completed}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                        {staff.processing}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#55C388] transition-all"
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[#55C388]">{successRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {staff.avgTime > 0 ? staff.avgTime : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {staffPerformance.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ยังไม่มีข้อมูลการทำงานของเจ้าหน้าที่
          </div>
        )}
      </div>
    </div>
  );
}