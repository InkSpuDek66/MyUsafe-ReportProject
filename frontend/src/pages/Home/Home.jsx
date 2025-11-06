// frontend/src/pages/Home/Home.jsx
// หน้าแสดงผลหลักของระบบรายงานปัญหาภายในมหาวิทยาลัย
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

// ฟังก์ชันดึง user ID จาก localStorage
const getUserId = () => {
    return localStorage.getItem('userId') || 'U0000000';
};

export default function Home() {
    const [complaints, setComplaints] = useState([]);
    const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const userId = getUserId();
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // หมวดหมู่ (ลบ emoji ออกแล้ว)
    const categories = [
        { id: "flood", name: "น้ำท่วม" },
        { id: "electrical", name: "ไฟฟ้า" },
        { id: "computer", name: "คอมพิวเตอร์/เว็บไซต์" },
        { id: "plumbing", name: "ประปา/ท่อน้ำ" },
        { id: "facilities", name: "สิ่งอำนวยความสะดวก" },
        { id: "cleanliness", name: "ความสะอาด" },
        { id: "safety", name: "ความปลอดภัย" },
        { id: "other", name: "อื่นๆ" },
    ];

    // โหลดข้อมูลเรื่องร้องเรียน
    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/complaints`);
            const json = await res.json();
            const data = json.success ? json.data : json;
            setComplaints(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Error loading complaints:', e);
            setError("โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // เปิด/ปิดหมวดหมู่
    const toggleCategory = (id) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // คำนวณสถิติ
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

    // กรองข้อมูล
    const filtered = useMemo(() => {
        return complaints.filter((c) => {
            // กรองตามสถานะ
            if (filterStatus !== "ทั้งหมด" && c.current_status !== filterStatus)
                return false;

            // กรองตามหมวดหมู่
            if (selectedCategories.length > 0) {
                const cates = Array.isArray(c.categories) ? c.categories : [];
                if (!selectedCategories.some((id) => cates.includes(id))) return false;
            }

            // ค้นหา
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

    // สีสถานะ
    const statusColor = (s) => {
        if (s === "รอรับเรื่อง") return "bg-red-100 text-red-800";
        if (s === "กำลังดำเนินการ") return "bg-yellow-100 text-yellow-800";
        if (s === "เสร็จสิ้น") return "bg-green-100 text-green-800";
        return "bg-gray-100 text-gray-700";
    };

    // ส่ง action (like, dislike)
    const sendAction = async (complaint_id, action) => {
        try {
            const userId = getUserId();
            await fetch(`${API}/api/complaints/${complaint_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, user_id: userId }),
            });
            load(); // โหลดข้อมูลใหม่
        } catch (e) {
            console.error('Error sending action:', e);
        }
    };

    // การ์ดสรุป
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

    // ฟังก์ชันเลือกไฟล์รูปภาพแรกที่ไม่ใช่วิดีโอ
    const findFirstImage = (attachments = []) => {
        const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        const found = attachments.find((file) =>
            imageExts.some((ext) => file.toLowerCase().endsWith(ext))
        );
        return found || attachments[0];
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl py-1  font-bold bg-gradient-to-r from-[#55C388] to-[#43A874] bg-clip-text text-transparent mb-2">
                    ระบบรายงานปัญหามหาวิทยาลัย
                </h1>
                <p className="text-gray-600">
                    ระบบจัดการและติดตามเรื่องร้องเรียนภายในมหาวิทยาลัย
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {summaryCards.map((card, index) => (
                    <div
                        key={index}
                        className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${card.color} shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium opacity-90">
                                    {card.title}
                                </p>
                                <h2 className="text-4xl font-bold mt-2">{card.value}</h2>
                                <p className="text-xs mt-2 opacity-80">{card.subtitle}</p>
                            </div>
                            <div className="opacity-30">{card.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-3 items-center justify-center mb-4">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[250px] max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหา ID, หัวข้อ, สถานที่..."
                            className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:outline-none"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                            className="px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] transition flex items-center gap-2"
                        >
                            สถานะ: {filterStatus} <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        {showStatusMenu && (
                            <div className="absolute z-10 mt-2 bg-white text-gray-800 rounded-lg shadow-lg p-2 min-w-[180px]">
                                {["ทั้งหมด", "รอรับเรื่อง", "กำลังดำเนินการ", "เสร็จสิ้น"].map(
                                    (status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setFilterStatus(status);
                                                setShowStatusMenu(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded hover:bg-[#E6F6EE] transition ${filterStatus === status
                                                    ? "bg-[#E6F6EE] text-[#55C388] font-semibold"
                                                    : ""
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Category Filter */}
                    <button
                        onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${selectedCategories.length > 0
                                ? "bg-[#55C388] text-white border-[#55C388]"
                                : "bg-[#55C388] text-white hover:bg-[#43A874]"
                            }`}
                    >
                        <FunnelIcon className="h-5 w-5" /> หมวดหมู่
                        {selectedCategories.length > 0 && (
                            <span className="ml-1 bg-white text-[#55C388] rounded-full px-2 py-0.5 text-xs font-bold">
                                {selectedCategories.length}
                            </span>
                        )}
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
                            className={`px-4 py-2 rounded-full border transition-all ${selectedCategories.includes(cat.id)
                                    ? "bg-[#55C388] text-white border-[#55C388]"
                                    : "border-[#55C388] text-[#55C388] hover:bg-[#55C388]/10"
                                }`}
                        >
                            {cat.name}
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
                        // แสดงตำแหน่ง
                        const locationDisplay = c.location
                            ? `${c.location.building} ชั้น ${c.location.floor} ${c.location.room ? `ห้อง ${c.location.room}` : ""
                            }`
                            : "ไม่ระบุ";

                        // ดึงรูปภาพแรกจาก field images
                        const imageFile = findFirstImage(c.images || []);
                        const imageUrl = imageFile
                            ? `${API}${imageFile}`
                            : "/MyUSafe_mini_none-bg_LOGO1.png";

                        // Debug: แสดง URL รูปภาพใน console
                        console.log('Home Card Image:', {
                            complaint_id: c.complaint_id,
                            raw_images: c.images,
                            imageFile: imageFile,
                            imageUrl: imageUrl
                        });

                        // จัดการ categories
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
                                {/* รูปภาพ */}
                                <div className="h-48 overflow-hidden bg-gray-100">
                                    <img
                                        src={imageUrl}
                                        alt={c.title}
                                        onError={(e) => {
                                            console.error('Image load error for complaint:', c.complaint_id, 'URL:', imageUrl);
                                            e.target.src = "/MyUSafe_mini_none-bg_LOGO1.png";
                                        }}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* เนื้อหา */}
                                <div className="p-4">
                                    {/* สถานะ */}
                                    <div
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${statusColor(
                                            c.current_status
                                        )}`}
                                    >
                                        {c.current_status}
                                    </div>

                                    {/* หัวข้อ */}
                                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                                        {c.title}
                                    </h3>

                                    {/* ID และวันที่ */}
                                    <div className="text-xs text-gray-500 mb-2">
                                        ID: {c.complaint_id} •{" "}
                                        {new Date(c.datetime_reported).toLocaleString("th-TH")}
                                    </div>

                                    {/* คำอธิบาย */}
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                        {c.description}
                                    </p>

                                    {/* Category Tags */}
                                    {cates.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {cates.map((cid, i) => {
                                                const cat = categories.find((cat) => cat.id === cid) || { name: cid };
                                                return (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1 text-xs rounded-full bg-[#E6F6EE] text-[#55C388] border border-[#55C388]/30"
                                                    >
                                                        {cat.name || cid}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* ตำแหน่งและจำนวนผู้เข้าชม */}
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

                                    {/* Like/Dislike */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                            {/* Like */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    sendAction(c.complaint_id, "like");
                                                }}
                                                className={`hover:text-[#55C388] transition flex items-center gap-1 ${c.liked_by?.includes(userId)
                                                        ? "text-[#55C388] font-bold"
                                                        : "text-gray-400"
                                                    }`}
                                            >
                                                <HandThumbUpIcon className="h-4 w-4" /> {c.likes || 0}
                                            </button>

                                            {/* Dislike */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    sendAction(c.complaint_id, "dislike");
                                                }}
                                                className={`hover:text-red-500 transition flex items-center gap-1 ${c.disliked_by?.includes(userId)
                                                        ? "text-red-500 font-bold"
                                                        : "text-gray-400"
                                                    }`}
                                            >
                                                <HandThumbDownIcon className="h-4 w-4" /> {c.dislikes || 0}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            <footer className="text-center mt-10 text-gray-500 text-sm">
                © 2025 ระบบรายงานปัญหามหาวิทยาลัย
            </footer>
        </div>
    );
}