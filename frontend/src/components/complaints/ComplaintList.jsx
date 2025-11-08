// frontend/src/components/complaints/ComplaintList.jsx
// Component สำหรับแสดงรายการเรื่องร้องเรียน พร้อมฟังก์ชันการค้นหาและกรอง
import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { categoryAPI } from '../../services/categoryAPI';
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
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const statusOptions = [
        'ทั้งหมด',
        'รอรับเรื่อง',
        'กำลังดำเนินการ',
        'เสร็จสิ้น',
        'ยกเลิก'
    ];

    // ดึงข้อมูลหมวดหมู่จาก API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await categoryAPI.getCategories();
                
                if (response.success && Array.isArray(response.data)) {
                    const allOption = { _id: 'all', name: 'ทั้งหมด', icon: '📋' };
                    setCategoryOptions([allOption, ...response.data]);
                } else {
                    setCategoryOptions([{ _id: 'all', name: 'ทั้งหมด', icon: '📋' }]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategoryOptions([{ _id: 'all', name: 'ทั้งหมด', icon: '📋' }]);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // แปลง location เป็น searchable string
    const getLocationString = (location) => {
        if (!location) return '';

        if (typeof location === 'string') {
            return location.toLowerCase();
        }

        if (typeof location === 'object') {
            const parts = [];
            if (location.building) parts.push(location.building);
            if (location.floor) parts.push(location.floor);
            if (location.room) parts.push(location.room);
            return parts.join(' ').toLowerCase();
        }

        return '';
    };

    // เช็คว่า complaint มี category นี้หรือไม่
    const hasCategory = (complaint, categoryName) => {
        if (Array.isArray(complaint.categories)) {
            return complaint.categories.includes(categoryName);
        }
        
        if (complaint.category) {
            return complaint.category === categoryName;
        }
        
        return false;
    };

    // Filter logic
    useEffect(() => {
        if (!Array.isArray(complaints)) {
            setFilteredComplaints([]);
            return;
        }

        let filtered = [...complaints];

        // ค้นหา
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(complaint => {
                if (complaint.title?.toLowerCase().includes(query)) return true;
                if (complaint.description?.toLowerCase().includes(query)) return true;
                if (complaint.complaint_id?.toLowerCase().includes(query)) return true;
                
                const locationString = getLocationString(complaint.location);
                if (locationString.includes(query)) return true;

                return false;
            });
        }

        // กรองตามสถานะ
        if (statusFilter !== 'ทั้งหมด') {
            filtered = filtered.filter(complaint =>
                complaint.current_status === statusFilter ||
                complaint.status === statusFilter
            );
        }

        // กรองตามหมวดหมู่
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
            {showFilters && (
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
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

                    <div className="flex flex-col sm:flex-row gap-4">
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

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                หมวดหมู่
                            </label>
                            {loadingCategories ? (
                                <div className="text-gray-500 text-sm">กำลังโหลดหมวดหมู่...</div>
                            ) : categoryOptions.length === 0 ? (
                                <div className="text-gray-500 text-sm">ไม่มีข้อมูลหมวดหมู่</div>
                            ) : (
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent text-gray-700"
                                >
                                    {categoryOptions.map(category => (
                                        <option key={category._id} value={category.name}>
                                            {category.icon && `${category.icon} `}{category.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="text-sm text-gray-600">
                        แสดงผล {filteredComplaints.length} จาก {complaints.length} รายการ
                    </div>
                </div>
            )}

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