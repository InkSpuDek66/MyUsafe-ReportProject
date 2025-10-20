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

    // Helper function สำหรับแสดง location
    const formatLocation = (location) => {
        if (!location) return 'ไม่ระบุ';

        // ถ้า location เป็น string (old format)
        if (typeof location === 'string') {
            return location;
        }

        // ถ้า location เป็น object (new format)
        if (typeof location === 'object') {
            const parts = [];
            if (location.building) parts.push(location.building);
            if (location.floor) parts.push(location.floor);
            if (location.room) parts.push(`ห้อง ${location.room}`);
            return parts.length > 0 ? parts.join(' ') : 'ไม่ระบุ';
        }

        return 'ไม่ระบุ';
    };

    // Helper function สำหรับเลือกภาพที่จะแสดง
    const getDisplayImage = () => {
        // ลำดับความสำคัญ: attachments[0] > images[0] > attachment > default logo
        
        // 1. ตรวจสอบ attachments (จากฐานข้อมูลจริง)
        if (complaint.attachments && Array.isArray(complaint.attachments) && complaint.attachments.length > 0) {
            return `http://localhost:5000${complaint.attachments[0]}`;
        }
        
        // 2. ตรวจสอบ images (format อื่น)
        if (complaint.images && Array.isArray(complaint.images) && complaint.images.length > 0) {
            return complaint.images[0];
        }
        
        // 3. ตรวจสอบ attachment (format เดี่ยว)
        if (complaint.attachment) {
            return complaint.attachment;
        }
        
        // 4. Default logo
        return '/MyUSafe_mini_none-bg_LOGO1.png';
    };

    // Category icons mapping พร้อมชื่อภาษาไทย
    const categoryIcons = {
        'flood': { icon: '💧', name: 'น้ำท่วม' },
        'electrical': { icon: '⚡', name: 'ไฟฟ้า' },
        'computer': { icon: '💻', name: 'คอมพิวเตอร์' },
        'plumbing': { icon: '🚰', name: 'ประปา' },
        'facilities': { icon: '🏢', name: 'สิ่งอำนวยความสะดวก' },
        'cleanliness': { icon: '🧹', name: 'ความสะอาด' },
        'safety': { icon: '🚨', name: 'ความปลอดภัย' },
        'other': { icon: '📝', name: 'อื่นๆ' }
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
            {/* Image/Video Section */}
            <div className="h-48 overflow-hidden bg-gray-100 relative">
                {(() => {
                    const mediaUrl = getDisplayImage();
                    const isDefaultLogo = mediaUrl === '/MyUSafe_mini_none-bg_LOGO1.png';
                    const isVideo = !isDefaultLogo && mediaUrl.match(/\.(mp4|mov|avi|webm)$/i);
                    
                    if (isVideo) {
                        return (
                            <>
                                <video
                                    src={mediaUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    preload="metadata"
                                    onError={(e) => {
                                        console.error('Video load error:', mediaUrl);
                                        e.target.style.display = 'none';
                                        const fallback = e.target.parentElement.querySelector('.fallback-image');
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                                <div 
                                    className="fallback-image w-full h-full hidden items-center justify-center bg-gray-200"
                                    style={{ display: 'none' }}
                                >
                                    <img 
                                        src="/MyUSafe_mini_none-bg_LOGO1.png" 
                                        alt="Default" 
                                        className="w-full h-full object-contain p-8"
                                    />
                                </div>
                                {/* Video Play Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                                    <div className="bg-black/60 rounded-full p-3 backdrop-blur-sm shadow-lg">
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                    </div>
                                </div>
                            </>
                        );
                    }
                    
                    return (
                        <img
                            src={mediaUrl}
                            alt={complaint.title}
                            className={`w-full h-full ${isDefaultLogo ? 'object-contain p-8' : 'object-cover group-hover:scale-110 transition-transform duration-500'}`}
                            onError={(e) => {
                                console.error('Image load error:', mediaUrl);
                                e.target.src = '/MyUSafe_mini_none-bg_LOGO1.png';
                                e.target.className = 'w-full h-full object-contain p-8';
                            }}
                        />
                    );
                })()}
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
                        {categories.map((cat, index) => {
                            const categoryInfo = categoryIcons[cat] || { icon: '📝', name: cat };
                            return (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                >
                                    <span>{categoryInfo.icon}</span>
                                    <span>{categoryInfo.name}</span>
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-[#55C388] transition-colors break-words whitespace-pre-wrap">
                    {complaint.title}
                </h3>

                {/* Complaint ID */}
                <p className="text-xs text-gray-500 mb-2">
                    ID: {complaint.complaint_id || complaint.id}
                </p>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-words whitespace-pre-wrap">
                    {complaint.description}
                </p>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin size={16} className="text-[#55C388]" />
                    <span className="truncate">
                        {formatLocation(complaint.location)}
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