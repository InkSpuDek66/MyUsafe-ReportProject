// frontend/src/pages/staff/AssignmentDetail.jsx
// หน้าแสดงรายละเอียดงานที่มอบหมายให้เจ้าหน้าที่
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, User, FileText, AlertTriangle, Eye, X, ChevronLeft, ChevronRight, Loader2, CheckCircle, Upload, Trash2 } from "lucide-react";
import { io } from "socket.io-client";
import StatusBadge from '../../components/complaints/StatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import StatusTimeline from '../../components/complaints/StatusTimeline';
import { complaintAPI } from '../../services/complaintAPI';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_BASE_URL);

export default function AssignmentDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showResolutionModal, setShowResolutionModal] = useState(false);
    const [resolutionNote, setResolutionNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // สำหรับอัปโหลดไฟล์
    const [resolutionFiles, setResolutionFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);

    // สำหรับ Image Carousel
    const [previewMedia, setPreviewMedia] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // User data
    const currentUser = {
        user_id: localStorage.getItem('userId') || localStorage.getItem('user_id') || 'U0000001',
        user_role: localStorage.getItem('role') || localStorage.getItem('user_role') || 'staff'
    };

    const isStaffOrAdmin = ['staff', 'admin'].includes(currentUser.user_role);

    // หมวดหมู่
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

    const fetchComplaint = async () => {
        try {
            setLoading(true);
            const response = await complaintAPI.getById(id);
            setData(response.data);
        } catch (err) {
            console.error("❌ Error loading complaint:", err);
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchComplaint();

        socket.emit("view_complaint", id);
        socket.on("update_views", (socketData) => {
            if (socketData.id === id) {
                setData((prev) => ({ ...prev, views: socketData.views }));
            }
        });
        return () => socket.off("update_views");
    }, [id]);

    // จัดการการเลือกไฟล์
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalFiles = resolutionFiles.length + files.length;

        if (totalFiles > 5) {
            alert('อัปโหลดได้สูงสุด 5 ไฟล์เท่านั้น');
            return;
        }

        // ตรวจสอบประเภทไฟล์
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
        const validFiles = files.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                alert(`ไฟล์ ${file.name} ไม่รองรับ`);
                return false;
            }
            if (file.size > 20 * 1024 * 1024) {
                alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 20MB`);
                return false;
            }
            return true;
        });

        // สร้าง preview
        const newPreviews = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' : 'image'
        }));

        setResolutionFiles(prev => [...prev, ...validFiles]);
        setFilePreviews(prev => [...prev, ...newPreviews]);
    };

    // ลบไฟล์
    const removeFile = (index) => {
        URL.revokeObjectURL(filePreviews[index].preview);
        setResolutionFiles(prev => prev.filter((_, i) => i !== index));
        setFilePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleCompleteTask = async () => {
        if (!resolutionNote.trim()) {
            alert('กรุณากรอกรายละเอียดการแก้ไข');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('resolution_note', resolutionNote.trim());
            formData.append('updated_by', currentUser.user_id || 'Staff');

            // เพิ่มไฟล์ทั้งหมด
            resolutionFiles.forEach(file => {
                formData.append('resolution_images', file);
            });

            const res = await fetch(`${API_BASE_URL}/api/complaints/${id}/complete`, {
                method: 'PATCH',
                body: formData // ไม่ต้องกำหนด Content-Type เพราะ browser จะจัดการให้
            });

            if (res.ok) {
                alert('เปลี่ยนสถานะเป็นเสร็จสิ้นแล้ว');
                setShowResolutionModal(false);
                setResolutionNote("");
                setResolutionFiles([]);
                filePreviews.forEach(p => URL.revokeObjectURL(p.preview));
                setFilePreviews([]);
                await fetchComplaint();
            } else {
                const error = await res.json();
                alert(error.error || 'เปลี่ยนสถานะไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Error completing task:', err);
            alert('เกิดข้อผิดพลาด');
        } finally {
            setSubmitting(false);
        }
    };

    const nextMedia = () => {
        if (!attachments.length) return;
        setCurrentIndex((prev) => (prev + 1) % attachments.length);
    };

    const prevMedia = () => {
        if (!attachments.length) return;
        setCurrentIndex(
            (prev) => (prev - 1 + attachments.length) % attachments.length
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
                <Loader2 className="animate-spin text-[#55C388] mb-2" size={32} />
                กำลังโหลดข้อมูล...
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
                <AlertTriangle size={40} className="mb-2 text-yellow-500" />
                ไม่พบข้อมูลเรื่องร้องเรียน
            </div>
        );
    }

    const attachments = Array.isArray(data.images)
        ? data.images
            .filter(file => file && file !== '')
            .map(file => {
                if (file.startsWith('http://') || file.startsWith('https://')) return file;
                const imagePath = file.startsWith('/uploads') ? file : `/uploads/${file}`;
                return `${API_BASE_URL}${imagePath}`;
            })
        : data.image
            ? [data.image.startsWith('http') ? data.image : `${API_BASE_URL}${data.image}`]
            : [];


    const currentFile = attachments[currentIndex];
    const cates = Array.isArray(data.categories)
        ? data.categories
        : data.categories
            ? [data.categories]
            : [];

    return (
        <div className="min-h-screen p-4 sm:p-6">
            <div className="max-w-5xl mx-auto w-full px-2 sm:px-4">
                <Link
                    to="/assignments"
                    className="inline-flex items-center gap-2 hover:text-[#55C388] mb-4 sm:mb-6 transition-colors"
                >
                    <ArrowLeft size={18} /> กลับหน้างานที่มอบหมาย
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-green-100 rounded-3xl shadow-xl overflow-hidden"
                >
                    <div className="relative bg-gray-50 flex justify-center items-center h-96">
                        {attachments.length > 0 ? (
                            <>
                                {currentFile.match(/\.(mp4|webm|ogg)$/i) ? (
                                    <video
                                        src={currentFile}
                                        controls
                                        className="rounded-xl w-full h-full object-contain cursor-pointer"
                                    />
                                ) : (
                                    <img
                                        src={currentFile}
                                        alt={`attachment-${currentIndex}`}
                                        onClick={() => setPreviewMedia(currentFile)}
                                        className="rounded-xl w-full h-full object-contain cursor-pointer"
                                    />
                                )}

                                {attachments.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevMedia}
                                            className="absolute left-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={nextMedia}
                                            className="absolute right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                        <div className="absolute bottom-3 flex gap-1 justify-center w-full">
                                            {attachments.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full ${i === currentIndex
                                                        ? "bg-[#55C388]"
                                                        : "bg-white/50"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <img
                                src="/MyUSafe_mini_none-bg_LOGO1.png"
                                alt="default"
                                className="w-full h-full object-contain bg-gray-50"
                            />
                        )}
                    </div>

                    <div className="p-4 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                            <div className="flex-1 w-full min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#55C388] mb-2 break-words">
                                    {data.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <StatusBadge status={data.current_status} />
                                    <PriorityBadge priority={data.priority} />
                                </div>
                            </div>

                            {/* ปุ่มเสร็จสิ้น - แสดงเฉพาะเมื่อสถานะเป็น "กำลังดำเนินการ" */}
                            {isStaffOrAdmin && data.current_status === 'กำลังดำเนินการ' && (
                                <button
                                    onClick={() => setShowResolutionModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
                                >
                                    <CheckCircle size={18} />
                                    เสร็จสิ้น
                                </button>
                            )}
                        </div>

                        {cates.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {cates.map((cid, i) => {
                                    const cat = categories.find((c) => c.id === cid) || {};
                                    return (
                                        <span
                                            key={i}
                                            className="px-3 py-1 text-sm rounded-full bg-[#E6F6EE] text-[#55C388] border border-[#55C388]/30 flex items-center gap-1"
                                        >
                                            {cat.icon} {cat.name || cid}
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        <p className="text-gray-700 mb-5 leading-relaxed text-sm sm:text-base break-words">
                            {data.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 text-sm text-gray-600 mb-6">
                            <div className="flex items-center gap-2">
                                <MapPin className="text-[#55C388]" size={18} />
                                <span>
                                    สถานที่:{" "}
                                    {data.location
                                        ? `${data.location.building || ""} ${data.location.floor || ""
                                        } ${data.location.room || ""}`
                                        : "-"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="text-[#55C388]" size={18} />
                                <span>
                                    วันที่แจ้ง:{" "}
                                    {data.datetime_reported
                                        ? new Date(data.datetime_reported).toLocaleString("th-TH")
                                        : "-"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="text-[#55C388]" size={18} />
                                <span>ผู้แจ้ง: {data.user_id || "-"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="text-[#55C388]" size={18} />
                                <span>จำนวนผู้เข้าชม: {data.views || 0}</span>
                            </div>
                        </div>

                        {/* แสดงรายละเอียดการแก้ไข */}
                        {data.resolution_note && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                    <CheckCircle size={18} />
                                    รายละเอียดการแก้ไข
                                </h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{data.resolution_note}</p>
                            </div>
                        )}
                        {/* แสดงรูปภาพ/วิดีโอหลังการแก้ไข */}
                        {Array.isArray(data.resolution_attachments) && data.resolution_attachments.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                    <CheckCircle size={18} />
                                    รูปภาพ/วิดีโอหลังการแก้ไข
                                </h4>
                                <div className="relative bg-gray-100 rounded-lg p-4 flex justify-center items-center">
                                    <img
                                        src={`${API_BASE_URL}${data.resolution_attachments[0]}`}
                                        alt="resolution"
                                        className="rounded-lg max-h-80 object-contain cursor-pointer"
                                        onClick={() => setPreviewMedia(`${API_BASE_URL}${data.resolution_attachments[0]}`)}
                                        onError={(e) => (e.target.src = '/MyUSafe_mini_none-bg_LOGO1.png')}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-8 border-t border-green-100 pt-6">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4 text-base sm:text-lg">
                                <FileText className="text-[#55C388]" size={20} /> ประวัติสถานะ
                            </h3>
                            <StatusTimeline history={data.status_history} />
                        </div>
                    </div>
                </motion.div>

                <footer className="text-center text-gray-400 text-xs sm:text-sm mt-10">
                    © 2025 ระบบรายงานปัญหามหาวิทยาลัย
                </footer>
            </div>

            {/* Modal กรอกรายละเอียดการแก้ไข */}
            {showResolutionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-green-600" size={24} />
                            ยืนยันการเสร็จสิ้นงาน
                        </h3>

                        <p className="text-gray-600 mb-4">
                            กรุณากรอกรายละเอียดการแก้ไขปัญหา
                        </p>

                        <textarea
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            placeholder="เช่น ได้ทำการซ่อมแซมท่อน้ำที่รั่วเรียบร้อยแล้ว ใช้เวลา 2 ชั่วโมง..."
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none mb-4"
                            disabled={submitting}
                        />

                        {/* ส่วนอัปโหลดไฟล์ */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                แนบรูปภาพ/วิดีโอหลังการแก้ไข (ไม่บังคับ, สูงสุด 5 ไฟล์)
                            </label>

                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                                <div className="text-center">
                                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                    <p className="text-sm text-gray-600">คลิกเพื่อเลือกไฟล์</p>
                                    <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, GIF, MP4 (ไฟล์ละไม่เกิน 20MB)</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    disabled={submitting || resolutionFiles.length >= 5}
                                />
                            </label>

                            {/* แสดง Preview ไฟล์ที่เลือก */}
                            {filePreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                                    {filePreviews.map((item, index) => (
                                        <div key={index} className="relative group">
                                            {item.type === 'video' ? (
                                                <video
                                                    src={item.preview}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <img
                                                    src={item.preview}
                                                    alt={`preview-${index}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                            )}
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={submitting}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowResolutionModal(false);
                                    setResolutionNote("");
                                    setResolutionFiles([]);
                                    filePreviews.forEach(p => URL.revokeObjectURL(p.preview));
                                    setFilePreviews([]);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={submitting}
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleCompleteTask}
                                disabled={submitting || !resolutionNote.trim()}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    'ยืนยัน'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewMedia && (
                <div
                    className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
                    onClick={() => setPreviewMedia(null)}
                >
                    <button
                        className="absolute top-5 right-5 text-white"
                        onClick={() => setPreviewMedia(null)}
                    >
                        <X size={30} />
                    </button>
                    {previewMedia.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                            src={previewMedia}
                            controls
                            autoPlay
                            className="max-w-4xl max-h-[90vh] rounded-xl"
                        />
                    ) : (
                        <img
                            src={previewMedia}
                            alt="preview"
                            className="max-w-4xl max-h-[90vh] rounded-xl object-contain"
                        />
                    )}
                </div>
            )}
        </div>
    );
}