// frontend/src/components/complaints/ComplaintCard.jsx
// Component สำหรับแสดงการ์ดเรื่องร้องเรียน
import { MapPin, Clock, Eye, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const ComplaintCard = ({ complaint }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/complaint/${complaint.complaint_id || complaint.id}`);
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Category icons mapping
    const categoryIcons = {
        'flood': '💧',
        'electrical': '⚡',
        'computer': '💻',
        'plumbing': '🚰',
        'facilities': '🏢',
        'cleanliness': '🧹',
        'safety': '🚨',
        'other': '📝'
    };

    // Get categories array (support both old and new format)
    const categories = Array.isArray(complaint.categories) 
        ? complaint.categories 
        : complaint.category 
        ? [complaint.category] 
        : [];

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-[#55C388] group"
        >
            {/* Image Section */}
            <div className="h-48 overflow-hidden bg-gray-100">
                <img
                    src={
                        complaint.attachment || 
                        complaint.images?.[0] || 
                        '/MyUSafe_mini_none-bg_LOGO1.png'
                    }
                    alt={complaint.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>

            {/* Content Section */}
            <div className="p-5">
                {/* Status and Priority Badges */}
                <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status={complaint.current_status || complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                </div>

                {/* Categories Tags */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {categories.map((cat, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                            >
                                <span>{categoryIcons[cat] || '📝'}</span>
                                <span>{cat}</span>
                            </span>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-[#55C388] transition-colors">
                    {complaint.title}
                </h3>

                {/* Complaint ID */}
                <p className="text-xs text-gray-500 mb-2">
                    ID: {complaint.complaint_id || complaint.id}
                </p>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {complaint.description}
                </p>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin size={16} className="text-[#55C388]" />
                    <span className="truncate">
                        {complaint.location || 'ไม่ระบุ'}
                    </span>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <Clock size={14} className="text-[#55C388]" />
                        <span>{formatDate(complaint.datetime_reported || complaint.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {complaint.views !== undefined && (
                            <div className="flex items-center gap-1">
                                <Eye size={14} />
                                <span>{complaint.views || 0}</span>
                            </div>
                        )}
                        {complaint.reporter_id && (
                            <div className="flex items-center gap-1">
                                <User size={14} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintCard;