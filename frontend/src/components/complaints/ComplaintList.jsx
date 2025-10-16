// frontend/src/components/complaints/ComplaintList.jsx
// Component สำหรับแสดงรายการเรื่องร้องเรียน พร้อมฟังก์ชันการค้นหาและกรอง
import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import ComplaintCard from './ComplaintCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

const ComplaintList = ({
    complaints = [],
    loading = false,
    showFilters = true
}) => {
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
    const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');

    // Status options
    const statusOptions = [
        'ทั้งหมด',
        'รอรับเรื่อง',
        'กำลังดำเนินการ',
        'เสร็จสิ้น',
        'ยกเลิก'
    ];

    // Category options
    const categoryOptions = [
        'ทั้งหมด',
        'น้ำท่วม',
        'ไฟฟ้า',
        'คอมพิวเตอร์/เว็บไซต์',
        'อื่นๆ'
    ];

    // Filter logic
    useEffect(() => {
        let filtered = [...complaints];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(complaint =>
                complaint.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                complaint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                complaint.complaint_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                complaint.location?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'ทั้งหมด') {
            filtered = filtered.filter(complaint =>
                complaint.current_status === statusFilter ||
                complaint.status === statusFilter
            );
        }

        // Category filter
        if (categoryFilter !== 'ทั้งหมด') {
            filtered = filtered.filter(complaint =>
                complaint.category === categoryFilter
            );
        }

        setFilteredComplaints(filtered);
    }, [complaints, searchQuery, statusFilter, categoryFilter]);

    if (loading) {
        return <LoadingSpinner size="lg" text="กำลังโหลดข้อมูล..." />;
    }

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="🔍 ค้นหา ID, คำบรรยาย, ตำแหน่ง..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Status Filter */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Filter size={16} className="inline mr-1" />
                                สถานะ
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {statusOptions.map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${statusFilter === status
                                                ? 'bg-[#55C388] text-white border-[#55C388]'
                                                : 'border-[#55C388] text-[#55C388] hover:bg-[#55C388]/10'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                หมวดหมู่
                            </label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent"
                            >
                                {categoryOptions.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="text-sm text-gray-600">
                        แสดงผล {filteredComplaints.length} จาก {complaints.length} รายการ
                    </div>
                </div>
            )}

            {/* Complaints Grid */}
            {filteredComplaints.length === 0 ? (
                <EmptyState
                    title="ไม่พบเรื่องร้องเรียน"
                    description="ไม่มีเรื่องร้องเรียนที่ตรงกับเงื่อนไขการค้นหา"
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredComplaints.map((complaint) => (
                        <ComplaintCard
                            key={complaint.complaint_id || complaint.id}
                            complaint={complaint}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComplaintList;