import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, User, CheckCircle, FileText, AlertTriangle, Eye, X, ChevronLeft, ChevronRight, Edit, UserPlus, Trash2, Loader2, ChevronDown, ChevronUp, Image as ImageIcon} from "lucide-react";
import { io } from "socket.io-client";
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import StatusTimeline from './StatusTimeline';
import CommentSection from './CommentSection';
import StatusUpdateModal from './StatusUpdateModal';
import AssignmentModal from './AssignmentModal';
import { complaintAPI } from '../../services/complaintAPI';

const API_BASE_URL = 'http://localhost:5000';
const socket = io("http://localhost:5000");

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  
  // สำหรับ Image Carousel
  const [previewMedia, setPreviewMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // สำหรับแสดง/ซ่อนรูปภาพหลังแก้ไข
  const [showResolutionMedia, setShowResolutionMedia] = useState(false);
  const [resolutionMediaIndex, setResolutionMediaIndex] = useState(0);

  // ดึง user data จาก localStorage
  const currentUser = {
    user_id: localStorage.getItem('user_id') || 'U0000001',
    user_role: localStorage.getItem('user_role') || 'reporter'
  };

  const isStaffOrAdmin = ['staff', 'admin'].includes(currentUser.user_role);
  const isOwner = data?.user_id === currentUser.user_id;

  // หมวดหมู่
  const categories = [
    { id: "flood", name: "น้ำท่วม" },
    { id: "electrical", name: "ไฟฟ้า" },
    { id: "computer", name: "คอมพิวเตอร์/เว็บไซต์" },
    { id: "plumbing", name: "ประปา/ท่อน้ำ" },
    { id: "facilities", name: "สิ่งอำนวยความสะดวก" },
    { id: "cleanliness", name: "ความสะอาด" },
    { id: "safety", name: "ความปลอดภัย" },
    { id: "other", name: "อื่นๆ" },
  ];

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getById(id);
      setData(response.data);
    } catch (err) {
      console.error("Error loading complaint:", err);
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

  const handleStatusUpdate = async (complaintId, updateData) => {
    try {
      await complaintAPI.updateStatus(complaintId, updateData.status, updateData.comment);
      alert('อัปเดตสถานะสำเร็จ');
      await fetchComplaint();
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!confirm('ต้องการลบเรื่องร้องเรียนนี้หรือไม่?')) return;

    try {
      await complaintAPI.delete(id);
      alert('ลบเรื่องร้องเรียนสำเร็จ');
      navigate('/my-complaints');
    } catch (error) {
      console.error('Delete error:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  // ฟังก์ชันสำหรับ Image Carousel
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

  // ฟังก์ชันสำหรับรูปภาพหลังแก้ไข
  const nextResolutionMedia = () => {
    if (!resolutionAttachments.length) return;
    setResolutionMediaIndex((prev) => (prev + 1) % resolutionAttachments.length);
  };

  const prevResolutionMedia = () => {
    if (!resolutionAttachments.length) return;
    setResolutionMediaIndex(
      (prev) => (prev - 1 + resolutionAttachments.length) % resolutionAttachments.length
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

  // จัดการรูปภาพที่แนบมา - ปรับปรุงให้รองรับ path format ต่างๆ
  const attachments = Array.isArray(data.images)
    ? data.images
        .filter(file => file && file !== '') // กรองไฟล์ว่างออก
        .map(file => {
          // ถ้าเป็น absolute URL ใช้ได้เลย
          if (file.startsWith('http://') || file.startsWith('https://')) {
            return file;
          }
          // ถ้ามี /uploads นำหน้าแล้ว ใช้ได้เลย
          const imagePath = file.startsWith('/uploads') ? file : `/uploads/${file}`;
          return `${API_BASE_URL}${imagePath}`;
        })
    : data.image
      ? [data.image.startsWith('http') ? data.image : `${API_BASE_URL}${data.image}`]
      : [];

  // จัดการรูปภาพหลังแก้ไข
  const resolutionAttachments = Array.isArray(data.resolution_attachments)
    ? data.resolution_attachments
        .filter(file => file && file !== '')
        .map(file => {
          if (file.startsWith('http://') || file.startsWith('https://')) {
            return file;
          }
          const imagePath = file.startsWith('/uploads') ? file : `/uploads/${file}`;
          return `${API_BASE_URL}${imagePath}`;
        })
    : [];

  // Debug: แสดง URL รูปภาพใน console
  console.log('ComplaintDetail Images:', {
    raw_images: data.images,
    processed_attachments: attachments,
    api_base: API_BASE_URL
  });

  const currentFile = attachments[currentIndex];
  const currentResolutionFile = resolutionAttachments[resolutionMediaIndex];
  
  // จัดการ categories
  const cates = Array.isArray(data.categories)
    ? data.categories
    : data.categories
    ? [data.categories]
    : [];

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-5xl mx-auto w-full px-2 sm:px-4">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 hover:text-[#55C388] mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> กลับหน้าหลัก
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-green-100 rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Image Carousel Section */}
          <div className="relative bg-gray-50 flex justify-center items-center h-96">
            {attachments.length > 0 ? (
              <>
                {currentFile.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={currentFile}
                    controls
                    className="rounded-lg max-h-full max-w-full object-contain"
                    onError={(e) => {
                      console.error('Video load error:', currentFile);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <img
                    src={currentFile}
                    alt={`attachment-${currentIndex}`}
                    onClick={() => setPreviewMedia(currentFile)}
                    className="rounded-lg max-h-full max-w-full object-contain cursor-pointer"
                    onError={(e) => {
                      console.error('Image load error:', currentFile);
                      e.target.src = '/MyUSafe_mini_none-bg_LOGO1.png';
                    }}
                  />
                )}

                {attachments.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="absolute left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextMedia}
                      className="absolute right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 flex gap-2 justify-center w-full">
                      {attachments.map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i === currentIndex
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
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ImageIcon size={64} className="mb-2" />
                <p>ไม่มีรูปภาพแนบมา</p>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            {/* Header with Status and Priority */}
            <div className="flex flex-wrap gap-3 items-center mb-4">
              <StatusBadge status={data.current_status} />
              <PriorityBadge priority={data.priority} />
              {isStaffOrAdmin && (
                <>
                  <button
                    onClick={() => setStatusModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit size={16} />
                    เปลี่ยนสถานะ
                  </button>
                  <button
                    onClick={() => setAssignModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <UserPlus size={16} />
                    มอบหมายงาน
                  </button>
                </>
              )}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ml-auto"
                >
                  <Trash2 size={16} />
                  ลบเรื่องร้องเรียน
                </button>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {data.title}
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              รหัสเรื่อง: {data.complaint_id}
            </p>

            {/* Categories */}
            {cates.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {cates.map((catId, index) => {
                  const cat = categories.find(c => c.id === catId) || { name: catId };
                  return (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm rounded-full bg-[#E6F6EE] text-[#55C388] border border-[#55C388]/30"
                    >
                      {cat.name}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">รายละเอียด</h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {data.description || 'ไม่มีรายละเอียด'}
              </p>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="text-[#55C388]" size={18} />
                <span>
                  สถานที่:{" "}
                  {data.location
                    ? `${data.location.building || ""} ${
                        data.location.floor || ""
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
              {data.assigned_to && (
                <div className="flex items-center gap-2">
                  <UserPlus className="text-[#55C388]" size={18} />
                  <span>เจ้าหน้าที่: {data.assigned_to}</span>
                </div>
              )}
            </div>

            {/* Resolution Section */}
            {data.resolution_note && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle size={18} />
                  รายละเอียดการแก้ไข
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap mb-2">{data.resolution_note}</p>
                
                {/* แสดงเวลาที่ใช้ในการแก้ไข */}
                {data.time_used && data.time_used !== '-' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 mt-2">
                    <Clock size={16} className="text-green-600" />
                    <span>เวลาที่ใช้ในการแก้ไข: <span className="font-semibold text-green-700">{data.time_used}</span></span>
                  </div>
                )}
                
                {/* ปุ่มแสดง/ซ่อนรูปภาพ */}
                {resolutionAttachments.length > 0 && (
                  <button
                    onClick={() => setShowResolutionMedia(!showResolutionMedia)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <ImageIcon size={16} />
                    {showResolutionMedia ? 'ซ่อนรูปภาพ/วิดีโอ' : 'ดูรูปภาพ/วิดีโอหลังแก้ไข'}
                    {showResolutionMedia ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
                
                {resolutionAttachments.length === 0 && (
                  <p className="text-gray-500 text-sm italic">ไม่มีรูปภาพ/วิดีโอที่แนบมา</p>
                )}
                
                {/* แสดงรูปภาพ/วิดีโอเมื่อกดปุ่ม */}
                {showResolutionMedia && resolutionAttachments.length > 0 && (
                  <div className="mt-4 relative bg-gray-100 rounded-lg p-4">
                    <div className="relative flex justify-center items-center h-64">
                      {currentResolutionFile.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={currentResolutionFile}
                          controls
                          className="rounded-lg max-h-full max-w-full object-contain cursor-pointer"
                          onError={(e) => {
                            console.error('Resolution video load error:', currentResolutionFile);
                          }}
                        />
                      ) : (
                        <img
                          src={currentResolutionFile}
                          alt={`resolution-${resolutionMediaIndex}`}
                          onClick={() => setPreviewMedia(currentResolutionFile)}
                          className="rounded-lg max-h-full max-w-full object-contain cursor-pointer"
                          onError={(e) => {
                            console.error('Resolution image load error:', currentResolutionFile);
                            e.target.src = '/MyUSafe_mini_none-bg_LOGO1.png';
                          }}
                        />
                      )}

                      {resolutionAttachments.length > 1 && (
                        <>
                          <button
                            onClick={prevResolutionMedia}
                            className="absolute left-2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={nextResolutionMedia}
                            className="absolute right-2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
                          >
                            <ChevronRight size={20} />
                          </button>
                          <div className="absolute bottom-2 flex gap-1 justify-center w-full">
                            {resolutionAttachments.map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i === resolutionMediaIndex
                                    ? "bg-green-600"
                                    : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                      {resolutionMediaIndex + 1} / {resolutionAttachments.length}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Status Timeline */}
            <div className="mt-8 border-t border-green-100 pt-6">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4 text-base sm:text-lg">
                <FileText className="text-[#55C388]" size={20} /> ประวัติสถานะ
              </h3>
              <StatusTimeline history={data.status_history} />
            </div>

            {/* Comments Section */}
            <div className="mt-8 border-t border-green-100 pt-6 text-gray-600">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4 text-base sm:text-lg">
                <FileText className="text-[#55C388]" size={20} /> ความคิดเห็น
              </h3>
              <CommentSection complaintId={data.complaint_id} />
            </div>
          </div>
        </motion.div>

        <footer className="text-center text-gray-400 text-xs sm:text-sm mt-10">
          © 2025 ระบบรายงานปัญหามหาวิทยาลัย
        </footer>
      </div>

      {/* Modals */}
      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        complaint={data}
        onUpdate={handleStatusUpdate}
      />

      <AssignmentModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        complaintId={data?.complaint_id}
        onAssign={fetchComplaint}
      />

      {/* Preview Media Modal */}
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