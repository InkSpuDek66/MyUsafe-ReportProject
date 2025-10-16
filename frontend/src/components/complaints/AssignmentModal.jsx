// frontend/src/components/complaints/AssignmentModal.jsx
// Component สำหรับมอบหมายงานให้เจ้าหน้าที่
import { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';

const AssignmentModal = ({ isOpen, onClose, onAssign, complaintId }) => {
    const [staff, setStaff] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStaff();
        }
    }, [isOpen]);

    const fetchStaff = async () => {
        try {
            // TODO: Replace with actual API
            const response = await fetch('http://localhost:5000/api/users?role=staff', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setStaff(data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAssign = async () => {
        if (!selectedStaff) return;

        try {
            setLoading(true);
            await onAssign(complaintId, selectedStaff.id);
            onClose();
        } catch (error) {
            console.error('Error assigning:', error);
            alert('เกิดข้อผิดพลาดในการมอบหมายงาน');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        มอบหมายงาน
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหาเจ้าหน้าที่..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Staff List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredStaff.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            ไม่พบเจ้าหน้าที่
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {filteredStaff.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedStaff(s)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                        selectedStaff?.id === s.id
                                            ? 'border-[#55C388] bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-[#55C388]/10 flex items-center justify-center">
                                            <User size={20} className="text-[#55C388]" />
                                        </div>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-gray-900">{s.name}</p>
                                        <p className="text-sm text-gray-600">{s.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedStaff || loading}
                        className="flex-1 px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'กำลังมอบหมาย...' : 'มอบหมาย'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentModal;