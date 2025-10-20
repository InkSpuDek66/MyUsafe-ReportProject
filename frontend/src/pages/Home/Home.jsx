import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  MapPinIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FunnelIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

export default function Home() {
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
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

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/complaints`);
      const json = await res.json();
      const data = json.success ? json.data : json;
      setComplaints(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const stats = useMemo(() => {
    const total = complaints.length;
    const counts = { รอรับเรื่อง: 0, กำลังดำเนินการ: 0, เสร็จสิ้น: 0 };
    complaints.forEach((c) => {
      const s = c.current_status || "รอรับเรื่อง";
      if (counts[s] !== undefined) counts[s]++;
    });
    const percentCompleted =
      total === 0 ? 0 : Math.round((counts["เสร็จสิ้น"] / total) * 100);
    return { total, counts, percentCompleted };
  }, [complaints]);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (filterStatus !== "ทั้งหมด" && c.current_status !== filterStatus)
        return false;

      if (selectedCategories.length > 0) {
        const cates = Array.isArray(c.categories) ? c.categories : [];
        if (!selectedCategories.some((id) => cates.includes(id))) return false;
      }

      if (q) {
        const qq = q.toLowerCase();
        const loc = c.location
          ? `${c.location.building} ${c.location.floor} ${c.location.room}`.toLowerCase()
          : "";
        const match =
          c.title?.toLowerCase().includes(qq) ||
          c.description?.toLowerCase().includes(qq) ||
          loc.includes(qq) ||
          c.complaint_id?.toLowerCase().includes(qq);
        if (!match) return false;
      }

      return true;
    });
  }, [complaints, filterStatus, q, selectedCategories]);

  const statusColor = (s) => {
    if (s === "รอรับเรื่อง") return "bg-red-100 text-red-800";
    if (s === "กำลังดำเนินการ") return "bg-yellow-100 text-yellow-800";
    if (s === "เสร็จสิ้น") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-700";
  };

  const sendAction = async (complaint_id, action) => {
    try {
      await fetch(`${API}/api/complaints/${complaint_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const summaryCards = [
    {
      title: "ทั้งหมด",
      value: stats.total,
      subtitle: "รวมเหตุการณ์ทั้งหมด",
      color: "from-[#55C388] to-[#43A874]",
      icon: <ClipboardDocumentListIcon className="h-10 w-10 text-white" />,
    },
    {
      title: "เสร็จสิ้น",
      value: stats.counts["เสร็จสิ้น"],
      subtitle: `${stats.percentCompleted}% ของทั้งหมด`,
      color: "from-green-500 to-green-600",
      icon: <CheckCircleIcon className="h-10 w-10 text-white" />,
    },
    {
      title: "รอรับเรื่อง",
      value: stats.counts["รอรับเรื่อง"],
      subtitle: "รอการตอบรับ / ดำเนินการ",
      color: "from-yellow-400 to-yellow-500",
      icon: <ClockIcon className="h-10 w-10 text-white" />,
    },
    {
      title: "กำลังดำเนินการ",
      value: stats.counts["กำลังดำเนินการ"],
      subtitle: "อยู่ระหว่างแก้ไขปัญหา",
      color: "from-blue-400 to-blue-600",
      icon: <Cog6ToothIcon className="h-10 w-10 text-white animate-spin-slow" />,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-[#55C388] drop-shadow-md">
        ระบบรายงานปัญหาภายในมหาวิทยาลัย
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={`rounded-xl bg-gradient-to-br ${card.color} p-4 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white text-xs opacity-80">{card.subtitle}</p>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {card.value}
                </h2>
              </div>
              <div className="bg-white/20 p-2 rounded-full">{card.icon}</div>
            </div>
            <p className="mt-2 text-white text-base font-semibold">
              {card.title}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full md:w-2/3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหา ID, หัวข้อ หรือสถานที่..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-[#55C388] outline-none shadow-sm"
          />
        </div>

        {/* Dropdown + Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-[#55C388] text-[#55C388] rounded-lg hover:bg-[#55C388]/10 transition"
            >
              <ChevronDownIcon className="h-5 w-5" />
              {filterStatus}
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-md w-40 z-10">
                {["ทั้งหมด", "รอรับเรื่อง", "กำลังดำเนินการ", "เสร็จสิ้น"].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setFilterStatus(s);
                        setShowStatusMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-[#55C388]/10 ${
                        filterStatus === s
                          ? "text-[#55C388] font-semibold"
                          : ""
                      }`}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Category filter */}
          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-[#55C388] text-white rounded-lg shadow hover:bg-[#43A874] transition"
          >
            <FunnelIcon className="h-5 w-5" /> หมวดหมู่
          </button>

          {/* Reset */}
          <button
            onClick={() => {
              setQ("");
              setFilterStatus("ทั้งหมด");
              setSelectedCategories([]);
            }}
            className="px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] transition"
          >
            รีเซ็ต
          </button>
        </div>
      </div>

      {/* Category Menu */}
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

      {/* Complaint Cards */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#55C388] mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-xl">ไม่พบข้อมูลเรื่องร้องเรียน</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const locationDisplay = c.location
              ? `${c.location.building} ชั้น ${c.location.floor} ${
                  c.location.room ? `ห้อง ${c.location.room}` : ""
                }`
              : "ไม่ระบุ";

            const imageUrl =
              c.attachments && c.attachments.length > 0
                ? `${API}${c.attachments[0]}`
                : "/MyUSafe_mini_none-bg_LOGO1.png";

            const cates = Array.isArray(c.categories)
              ? c.categories
              : c.categories
              ? [c.categories]
              : [];

            return (
              <div
                key={c.complaint_id}
                onClick={() => navigate(`/complaint/${c.complaint_id}`)}
                className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-[1.01] overflow-hidden group"
              >
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={c.title}
                    onError={(e) =>
                      (e.target.src = "/MyUSafe_mini_none-bg_LOGO1.png")
                    }
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${statusColor(
                      c.current_status
                    )}`}
                  >
                    {c.current_status}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {c.title}
                  </h3>
                  <div className="text-xs text-gray-500 mb-2">
                    ID: {c.complaint_id} •{" "}
                    {new Date(c.datetime_reported).toLocaleString("th-TH")}
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {c.description}
                  </p>

                  {/* 🟢 Category Tags */}
                  {cates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cates.map((cid, i) => {
                        const cat =
                          categories.find((cat) => cat.id === cid) || {};
                        return (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs rounded-full bg-[#E6F6EE] text-[#55C388] border border-[#55C388]/30 flex items-center gap-1"
                          >
                            {cat.icon} {cat.name || cid}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4 text-[#55C388]" />
                      {locationDisplay}
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                      {c.views || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sendAction(c.complaint_id, "like");
                        }}
                        className="hover:text-[#55C388] transition flex items-center gap-1"
                      >
                        <HandThumbUpIcon className="h-4 w-4" /> {c.likes || 0}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sendAction(c.complaint_id, "dislike");
                        }}
                        className="hover:text-red-500 transition flex items-center gap-1"
                      >
                        <HandThumbDownIcon className="h-4 w-4" />{" "}
                        {c.dislikes || 0}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <footer className="text-center mt-10 text-gray-500 text-sm">
        © University Traffy – หน้าแสดงผลแบบจำลอง
      </footer>
    </div>
  );
}
