// frontend/src/pages/Home/Home.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ClockIcon,
    Cog6ToothIcon,
    MapPinIcon,
    EyeIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
} from '@heroicons/react/24/solid';

export default function Home() {
    const [complaints, setComplaints] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // โหลดข้อมูลจาก API
    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/complaints`);
            const data = await res.json();
            setComplaints(data);
        } catch (e) {
            console.error('fetch error', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // คำนวณสถิติ
    const stats = useMemo(() => {
        const total = complaints.length;
        const counts = { 'รอรับเรื่อง': 0, 'ดำเนินการ': 0, 'เสร็จสิ้น': 0 };
        complaints.forEach((c) => {
            const s = c.current_status || 'รอรับเรื่อง';
            if (counts[s] !== undefined) counts[s] += 1;
        });
        const percentCompleted =
            total === 0 ? 0 : Math.round((counts['เสร็จสิ้น'] / total) * 100);
        return { total, counts, percentCompleted };
    }, [complaints]);

    // กรองข้อมูล
    const filtered = useMemo(() => {
        return complaints.filter((c) => {
            if (filterStatus && filterStatus !== 'ทั้งหมด') {
                if (c.current_status !== filterStatus) return false;
            }
            if (q) {
                const qq = q.toLowerCase();
                const match =
                    (c.title && c.title.toLowerCase().includes(qq)) ||
                    (c.description && c.description.toLowerCase().includes(qq)) ||
                    (c.location && c.location.toLowerCase().includes(qq)) ||
                    (c.complaint_id && c.complaint_id.toLowerCase().includes(qq));
                if (!match) return false;
            }
            return true;
        });
    }, [complaints, filterStatus, q]);

    const sendAction = async (complaint_id, action) => {
        try {
            await fetch(`${API}/api/complaints/${complaint_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            await load();
        } catch (e) {
            console.error(e);
        }
    };

    const statusColor = (s) => {
        if (s === 'รอรับเรื่อง') return 'bg-red-100 text-red-800';
        if (s === 'ดำเนินการ') return 'bg-yellow-100 text-yellow-800';
        if (s === 'เสร็จสิ้น') return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-700';
    };

    const summaryCards = [
        {
            title: 'ทั้งหมด',
            value: stats.total,
            subtitle: 'รวมเหตุการณ์ทั้งหมด',
            color: 'from-[#55C388] to-[#43A874]',
            icon: <ClipboardDocumentListIcon className="h-10 w-10 text-white" />,
        },
        {
            title: 'เสร็จสิ้น',
            value: stats.counts['เสร็จสิ้น'] || 0,
            subtitle: `${stats.percentCompleted}% ของทั้งหมด`,
            color: 'from-green-500 to-green-600',
            icon: <CheckCircleIcon className="h-10 w-10 text-white" />,
        },
        {
            title: 'รอรับเรื่อง',
            value: stats.counts['รอรับเรื่อง'] || 0,
            subtitle: 'รอการตอบรับ / ดำเนินการ',
            color: 'from-yellow-400 to-yellow-500',
            icon: <ClockIcon className="h-10 w-10 text-white" />,
        },
        {
            title: 'กำลังดำเนินการ',
            value: stats.counts['ดำเนินการ'] || 0,
            subtitle: 'อยู่ระหว่างแก้ไขปัญหา',
            color: 'from-blue-400 to-blue-600',
            icon: <Cog6ToothIcon className="h-10 w-10 text-white animate-spin-slow" />,
        },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-center mb-8 text-[#55C388] drop-shadow-md">
                ระบบรายงานปัญหาภายในมหาวิทยาลัย
            </h1>

            {/* สรุปสถิติ */}
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
                            <div className="bg-white/20 p-2 rounded-full">
                                {React.cloneElement(card.icon, { className: 'h-8 w-8 text-white' })}
                            </div>
                        </div>
                        <p className="mt-2 text-white text-base font-semibold">
                            {card.title}
                        </p>
                    </div>
                ))}
            </div>


            {/* ตัวกรอง */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                    {['ทั้งหมด', 'รอรับเรื่อง', 'ดำเนินการ', 'เสร็จสิ้น'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${filterStatus === s
                                    ? 'bg-[#55C388] text-white border-[#55C388]'
                                    : 'border-[#55C388] text-[#55C388] hover:bg-[#55C388]/10'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="🔍 ค้นหา ID, คำบรรยาย, ตำแหน่ง..."
                        className="border rounded-lg px-3 py-2 w-full md:w-72 focus:ring-2 focus:ring-[#55C388] outline-none"
                    />
                    <button
                        onClick={() => {
                            setQ('');
                            setFilterStatus('ทั้งหมด');
                        }}
                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                        รีเซ็ต
                    </button>
                </div>
            </div>

            {/* รายการเรื่องร้องเรียน */}
            {loading ? (
                <div className="text-center py-20 text-gray-600">กำลังโหลดข้อมูล...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((c) => (
                        <div
                            key={c.complaint_id}
                            onClick={() => navigate(`/complaint/${c.complaint_id}`)}
                            className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-[1.01] overflow-hidden group"
                        >
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={c.attachment || '../public/MyUSafe_mini_none-bg_LOGO1.png'}
                                    alt={c.title}
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
                                    ID: {c.complaint_id} •{' '}
                                    {new Date(c.datetime_reported).toLocaleString()}
                                </div>

                                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                    {c.description}
                                </p>

                                <div className="flex justify-between text-sm text-gray-500 mb-2">
                                    <span className="flex items-center gap-1">
                                        <MapPinIcon className="h-4 w-4 text-[#55C388]" />
                                        {c.location}
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
                                                sendAction(c.complaint_id, 'like');
                                            }}
                                            className="hover:text-[#55C388] transition flex items-center gap-1"
                                        >
                                            <HandThumbUpIcon className="h-4 w-4" /> {c.likes || 0}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                sendAction(c.complaint_id, 'dislike');
                                            }}
                                            className="hover:text-red-500 transition flex items-center gap-1"
                                        >
                                            <HandThumbDownIcon className="h-4 w-4" /> {c.dislikes || 0}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 mt-2 text-right">
                                    เสร็จสิ้น:{' '}
                                    {c.completed_date && c.completed_date !== '-'
                                        ? new Date(c.completed_date).toLocaleString()
                                        : '-'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <footer className="text-center mt-10 text-gray-500 text-sm">
                © University Traffy — หน้าแสดงผลแบบจำลอง
            </footer>
        </div>
    );
}
