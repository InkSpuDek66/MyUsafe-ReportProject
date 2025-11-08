// frontend/src/components/complaints/ComplaintCard.jsx
// Component สำหรับแสดงการ์ดเรื่องร้องเรียน พร้อมฟังก์ชันแก้ไขและลบ
import { useState, useEffect } from 'react';
import { MapPin, Clock, Eye, User, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../../services/complaintAPI';
import { categoryAPI } from '../../services/categoryAPI';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const ComplaintCard = ({ complaint, onUpdate, onDelete }) => {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [categoryMap, setCategoryMap] = useState({});
    const [currentUserId, setCurrentUserId] = useState(null);

    // ดึงข้อมูล userId จาก localStorage
    useEffect(() => {
        const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
        setCurrentUserId(userId);
    }, []);

    // ดึงข้อมูลหมวดหมู่จาก API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getCategories();
                if (response.success && Array.isArray(response.data)) {
                    const categoryMapping = {};
                    response.data.forEach(cat => {
                        categoryMapping[cat.name] = {
                            icon: cat.icon,
                            name: cat.name
                        };
                    });
                    setCategoryMap(categoryMapping);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // เช็คว่า user เป็นเจ้าของเรื่องร้องเรียนหรือไม่
    const isOwner = currentUserId && complaint.user_id === currentUserId;

    // เช็คว่าสามารถแก้ไขหรือลบได้หรือไม่ (เฉพาะสถานะ "รอรับเรื่อง" เท่านั้น)
    const canEdit = isOwner && (complaint.current_status === 'รอรับเรื่อง' || complaint.status === 'รอรับเรื่อง');

    // จัดการการคลิกการ์ด
    const handleCardClick = (e) => {
        // ไม่ให้คลิกการ์ดถ้ากำลังคลิกปุ่มแก้ไขหรือลบ
        if (e.target.closest('.action-button')) {
            return;
        }
        navigate(`/complaint/${complaint.complaint_id || complaint.id}`);
    };

    // จัดการการแก้ไข
    const handleEdit = async (e) => {
        e.stopPropagation();
        navigate(`/complaints/edit/${complaint.complaint_id || complaint.id}`);
    };

    // จัดการการลบ
    const handleDelete = async (e) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    // ยืนยันการลบ
    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await complaintAPI.delete(complaint.complaint_id || complaint.id);
            
            // เรียก callback function หลังลบสำเร็จ
            if (onDelete) {
                onDelete(complaint.complaint_id || complaint.id);
            }
            
            // แสดง notification
            alert('ลบเรื่องร้องเรียนสำเร็จ');
        } catch (error) {
            console.error('Error deleting complaint:', error);
            alert('เกิดข้อผิดพลาดในการลบเรื่องร้องเรียน');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
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

        if (typeof location === 'string') {
            return location;
        }

        if (typeof location === 'object') {
            const parts = [];
            if (location.building) parts.push(location.building);
            if (location.floor) parts.push(location.floor);
            if (location.room) parts.push(`ห้อง ${location.room}`);
            return parts.length > 0 ? parts.join(' ') : 'ไม่ระบุ';
        }

        return 'ไม่ระบุ';
    };

    // Helper function สำหรับตรวจสอบว่าไฟล์เป็นรูปภาพหรือไม่
    const isImageFile = (url) => {
        if (!url) return false;
        return url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) !== null;
    };

    // Helper function สำหรับหารูปภาพอันแรกจาก array
    const getFirstImageFromArray = (mediaArray) => {
        if (!mediaArray || !Array.isArray(mediaArray) || mediaArray.length === 0) {
            return null;
        }

        for (let i = 0; i < mediaArray.length; i++) {
            const item = mediaArray[i];
            if (isImageFile(item)) {
                return item;
            }
        }

        return null;
    };

    // Helper function สำหรับเลือกภาพที่จะแสดง
    const getDisplayImage = () => {
        // ลำดับความสำคัญ: attachments > images > default logo
        
        if (complaint.attachments && Array.isArray(complaint.attachments) && complaint.attachments.length > 0) {
            const firstImage = getFirstImageFromArray(complaint.attachments);
            if (firstImage) {
                return `http://localhost:5000${firstImage}`;
            }
        }
        
        if (complaint.images && Array.isArray(complaint.images) && complaint.images.length > 0) {
            const firstImage = getFirstImageFromArray(complaint.images);
            if (firstImage) {
                if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
                    return firstImage;
                }
                return `http://localhost:5000${firstImage}`;
            }
        }
        
        if (complaint.attachment && isImageFile(complaint.attachment)) {
            return complaint.attachment;
        }
        
        return '/MyUSafe_mini_none-bg_LOGO1.png';
    };

    // ดึงข้อมูล categories
    const complaintCategories = Array.isArray(complaint.categories)
        ? complaint.categories
        : complaint.category
            ? [complaint.category]
            : [];

    return (
        <>
            <div
                onClick={handleCardClick}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-[#55C388] group relative"
            >
                {/* Action Buttons - แสดงเฉพาะเมื่อเป็นเจ้าของและสถานะรอรับเรื่อง */}
                {canEdit && (
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <button
                            onClick={handleEdit}
                            className="action-button p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                            title="แก้ไข"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="action-button p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="ลบ"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}

                {/* Image Section */}
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                    {(() => {
                        const imageUrl = getDisplayImage();
                        const isDefaultLogo = imageUrl === '/MyUSafe_mini_none-bg_LOGO1.png';
                        
                        return (
                            <img
                                src={imageUrl}
                                alt={complaint.title}
                                className={`w-full h-full ${isDefaultLogo ? 'object-contain p-8' : 'object-cover group-hover:scale-110 transition-transform duration-500'}`}
                                onError={(e) => {
                                    console.error('Image load error:', imageUrl);
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
                    {complaintCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {complaintCategories.map((cat, index) => {
                                const categoryInfo = categoryMap[cat] || { icon: '📝', name: cat };
                                return (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                    >
                                        {categoryInfo.icon && <span>{categoryInfo.icon}</span>}
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (e.target === e.currentTarget) {
                            setShowDeleteModal(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">ยืนยันการลบ</h3>
                        <p className="text-gray-600 mb-6">
                            คุณแน่ใจหรือไม่ที่จะลบเรื่องร้องเรียน "{complaint.title}" ?
                            <br />
                            <span className="text-red-500 text-sm mt-2 inline-block">
                                การกระทำนี้ไม่สามารถย้อนกลับได้
                            </span>
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteModal(false);
                                }}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete();
                                }}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>กำลังลบ...</span>
                                    </>
                                ) : (
                                    'ลบ'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ComplaintCard;