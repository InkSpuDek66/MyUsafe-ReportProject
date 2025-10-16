// frontend/src/pages/user/MyComplaints.jsx
// Page สำหรับแสดงรายการเรื่องร้องเรียนของผู้ใช้ที่ล็อกอินแล้ว
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import ComplaintList from '../../components/complaints/ComplaintList';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyComplaints();
    }, []);

    const fetchMyComplaints = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            const response = await fetch('http://localhost:5000/api/complaints/my-complaints', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setComplaints(data);
        } catch (error) {
            console.error('Error fetching my complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            เรื่องร้องเรียนของฉัน
                        </h1>
                        <p className="text-gray-600 mt-2">
                            รายการเรื่องร้องเรียนทั้งหมดที่คุณได้แจ้ง
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/complaints/new')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] transition-colors shadow-md"
                    >
                        <PlusCircle size={20} />
                        แจ้งเรื่องใหม่
                    </button>
                </div>

                {/* Complaints List */}
                {loading ? (
                    <LoadingSpinner size="lg" />
                ) : (
                    <ComplaintList 
                        complaints={complaints}
                        loading={loading}
                        showFilters={true}
                    />
                )}
            </div>
        </div>
    );
};

export default MyComplaints;