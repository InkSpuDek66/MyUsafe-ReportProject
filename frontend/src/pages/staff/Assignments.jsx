// frontend/src/pages/staff/Assignments.jsx
// หน้าแสดงรายการงานที่มอบหมายให้เจ้าหน้าที่
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon, ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/solid';

export default function Assignments() {
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState({ role: null, userId: null });
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Categories definition
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

    useEffect(() => {
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        setCurrentUser({ role, userId });

        if (role === 'staff' && userId) {
            fetchAssignments(userId);
        } else if (role === 'admin') {
            fetchStaffList();
        }
    }, []);

    const fetchStaffList = async () => {
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

    const fetchAssignments = async (staffId) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/assignments/staff/${staffId}`);
            const json = await res.json();
            if (json.success) {
                setAssignments(json.data);
                setSelectedStaff(json.staff);
            }
        } catch (err) {
            console.error('Error fetching assignments:', err);
        } finally {
            setLoading(false);
        }
    };

    const statusBadgeClass = (status) => {
        if (status === 'รอรับเรื่อง') return 'bg-yellow-100 text-yellow-800';
        if (status === 'กำลังดำเนินการ') return 'bg-blue-100 text-blue-800';
        if (status === 'เสร็จสิ้น') return 'bg-green-100 text-green-800';
        if (status === 'ยกเลิก') return 'bg-gray-200 text-gray-800';
        return 'bg-gray-100 text-gray-800';
    };

    const priorityBadgeClass = (priority) => {
        if (priority === 'urgent') return 'bg-red-100 text-red-800';
        if (priority === 'high') return 'bg-orange-100 text-orange-800';
        if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
        if (priority === 'low') return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    const priorityLabel = (priority) => {
        if (priority === 'urgent') return 'ด่วนที่สุด';
        if (priority === 'high') return 'สำคัญ';
        if (priority === 'medium') return 'ปานกลาง';
        if (priority === 'low') return 'ต่ำ';
        return priority;
    };

    const summaryData = {
        total: assignments.length,
        processing: assignments.filter(c => c.current_status === 'กำลังดำเนินการ').length,
        completed: assignments.filter(c => c.current_status === 'เสร็จสิ้น').length,
        pending: assignments.filter(c => c.current_status === 'รอรับเรื่อง').length,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            <h1 className="text-3xl font-extrabold text-center mb-8 text-[#55C388]">
                {currentUser.role === 'admin' ? 'จัดการงานที่มอบหมาย' : 'งานของฉัน'}
            </h1>

            {/* Admin: Staff Selection */}
            {currentUser.role === 'admin' && (
                <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <UserGroupIcon className="h-6 w-6 text-[#55C388]" />
                        เลือกเจ้าหน้าที่
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {staffList.map((staff) => (
                            <button
                                key={staff._id}
                                onClick={() => fetchAssignments(staff._id)}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                    selectedStaff?._id === staff._id
                                        ? 'border-[#55C388] bg-green-50'
                                        : 'border-gray-200 hover:border-[#55C388] hover:bg-gray-50'
                                }`}
                            >
                                <div className="font-semibold text-gray-800">{staff.name}</div>
                                <div className="text-sm text-gray-600">{staff.email}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Staff Info + Summary Cards */}
            {(selectedStaff || currentUser.role === 'staff') && (
                <>
                    {/* Staff Info Header */}
                    {selectedStaff && (
                        <div className="bg-gradient-to-r from-[#55C388] to-[#43A874] rounded-xl shadow-lg p-6 mb-6 text-white">
                            <div className="flex items-center gap-3">
                                <UserGroupIcon className="h-12 w-12" />
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedStaff.name}</h2>
                                    <p className="text-green-100">{selectedStaff.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { title: 'ทั้งหมด', value: summaryData.total, color: 'from-[#55C388] to-[#43A874]', icon: <ClipboardDocumentListIcon className="h-8 w-8" /> },
                            { title: 'รอรับเรื่อง', value: summaryData.pending, color: 'from-yellow-400 to-yellow-500', icon: <ClockIcon className="h-8 w-8" /> },
                            { title: 'กำลังดำเนินการ', value: summaryData.processing, color: 'from-blue-400 to-blue-600', icon: <ClockIcon className="h-8 w-8" /> },
                            { title: 'เสร็จสิ้น', value: summaryData.completed, color: 'from-green-500 to-green-600', icon: <CheckCircleIcon className="h-8 w-8" /> },
                        ].map((card, i) => (
                            <div key={i} className={`rounded-xl bg-gradient-to-br ${card.color} p-4 shadow-md text-white`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-bold">{card.value}</h2>
                                        <p className="text-sm opacity-90 mt-1">{card.title}</p>
                                    </div>
                                    <div className="bg-white/20 p-2 rounded-full">{card.icon}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Assignments Table */}
                    <div className="bg-white rounded-xl shadow border border-green-100 p-6">
                        <h2 className="text-xl font-bold text-[#55C388] mb-4">
                            {currentUser.role === 'admin' && selectedStaff
                                ? `งานที่มอบหมายให้ ${selectedStaff.name}`
                                : 'รายการงานที่ได้รับมอบหมาย'}
                        </h2>

                        {loading ? (
                            <div className="text-center py-8 text-gray-600">กำลังโหลด...</div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-8 text-gray-600">ยังไม่มีงานที่มอบหมาย</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-green-50 border-b border-green-100">
                                        <tr>
                                            <th className="px-4 py-3">ID</th>
                                            <th className="px-4 py-3">หัวข้อ</th>
                                            <th className="px-4 py-3">หมวดหมู่</th>
                                            <th className="px-4 py-3">ความสำคัญ</th>
                                            <th className="px-4 py-3">สถานะ</th>
                                            <th className="px-4 py-3">วันที่มอบหมาย</th>
                                            <th className="px-4 py-3">วันที่แจ้ง</th>
                                            <th className="px-4 py-3">ดูรายละเอียด</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignments.map((c) => (
                                            <tr key={c.complaint_id} className="border-b hover:bg-green-50">
                                                <td className="px-4 py-3 font-mono text-xs">{c.complaint_id}</td>
                                                <td className="px-4 py-3 font-medium max-w-xs truncate">{c.title}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(c.categories || []).slice(0, 2).map((cat, i) => {
                                                            const categoryInfo = categories.find(category => category.id === cat);
                                                            const displayName = categoryInfo ? `${categoryInfo.icon} ${categoryInfo.name}` : cat;
                                                            
                                                            return (
                                                                <span 
                                                                    key={i} 
                                                                    className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-200"
                                                                >
                                                                    {displayName}
                                                                </span>
                                                            );
                                                        })}
                                                        {c.categories?.length > 2 && (
                                                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                                                +{c.categories.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityBadgeClass(c.priority)}`}>
                                                        {priorityLabel(c.priority)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(c.current_status)}`}>
                                                        {c.current_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {c.assigned_at ? new Date(c.assigned_at).toLocaleDateString('th-TH') : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {new Date(c.datetime_reported).toLocaleDateString('th-TH')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link 
                                                        to={`/assignment/${c.complaint_id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#55C388] text-white rounded-md text-sm hover:bg-[#43A874] font-medium transition-colors"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                        ดูรายละเอียด
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Admin: No Staff Selected */}
            {currentUser.role === 'admin' && !selectedStaff && (
                <div className="bg-white rounded-xl shadow border border-green-100 p-12 text-center">
                    <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        เลือกเจ้าหน้าที่เพื่อดูงานที่มอบหมาย
                    </h3>
                    <p className="text-gray-500">
                        กรุณาเลือกเจ้าหน้าที่จากรายการด้านบนเพื่อดูรายละเอียดงานที่มอบหมาย
                    </p>
                </div>
            )}
        </div>
    );
}