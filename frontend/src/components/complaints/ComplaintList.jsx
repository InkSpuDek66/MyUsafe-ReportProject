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
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Status options
    const statusOptions = [
        'ทั้งหมด',
        'รอรับเรื่อง',
        'กำลังดำเนินการ',
        'เสร็จสิ้น',
        'ยกเลิก'
    ];

    // Category options - ตรงกับฐานข้อมูล
    const categoryOptions = [
        { id: 'all', name: 'ทั้งหมด', icon: '📋' },
        { id: 'flood', name: 'น้ำท่วม', icon: '💧' },
        { id: 'electrical', name: 'ไฟฟ้า', icon: '⚡' },
        { id: 'computer', name: 'คอมพิวเตอร์/เว็บไซต์', icon: '💻' },
        { id: 'plumbing', name: 'ประปา/ท่อน้ำ', icon: '🚰' },
        { id: 'facilities', name: 'สิ่งอำนวยความสะดวก', icon: '🏢' },
        { id: 'cleanliness', name: 'ความสะอาด', icon: '🧹' },
        { id: 'safety', name: 'ความปลอดภัย', icon: '🚨' },
        { id: 'other', name: 'อื่นๆ', icon: '📝' }
    ];

    // Helper function สำหรับแปลง location เป็น searchable string
    const getLocationString = (location) => {
        if (!location) return '';

        // ถ้าเป็น string แล้ว return เลย
        if (typeof location === 'string') {
            return location.toLowerCase();
        }

        // ถ้าเป็น object ให้รวมทุกค่าเป็น string
        if (typeof location === 'object') {
            const parts = [];
            if (location.building) parts.push(location.building);
            if (location.floor) parts.push(location.floor);
            if (location.room) parts.push(location.room);
            return parts.join(' ').toLowerCase();
        }

        return '';
    };

    // Helper function สำหรับเช็คว่า complaint มี category นี้หรือไม่
    const hasCategory = (complaint, categoryId) => {
        // ถ้า complaint มี categories array (new format)
        if (Array.isArray(complaint.categories)) {
            return complaint.categories.includes(categoryId);
        }
        
        // ถ้า complaint มี category string (old format)
        if (complaint.category) {
            return complaint.category === categoryId;
        }
        
        return false;
    };

    // Filter logic
    useEffect(() => {
        // ป้องกัน error ถ้า complaints ไม่ใช่ array
        if (!Array.isArray(complaints)) {
            setFilteredComplaints([]);
            return;
        }

        let filtered = [...complaints];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(complaint => {
                // ค้นหาใน title
                if (complaint.title?.toLowerCase().includes(query)) return true;

                // ค้นหาใน description
                if (complaint.description?.toLowerCase().includes(query)) return true;

                // ค้นหาใน complaint_id
                if (complaint.complaint_id?.toLowerCase().includes(query)) return true;

                // ค้นหาใน location (รองรับทั้ง string และ object)
                const locationString = getLocationString(complaint.location);
                if (locationString.includes(query)) return true;

                return false;
            });
        }

        // Status filter
        if (statusFilter !== 'ทั้งหมด') {
            filtered = filtered.filter(complaint =>
                complaint.current_status === statusFilter ||
                complaint.status === statusFilter
            );
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(complaint => 
                hasCategory(complaint, categoryFilter)
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
                            placeholder="ค้นหา ID, คำบรรยาย, ตำแหน่ง..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent text-gray-700"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent text-gray-700"
                            >
                                {categoryOptions.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.icon} {category.name}
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