// frontend/src/components/complaints/ComplaintDetail.jsx
// Component สำหรับแสดงรายละเอียดเรื่องร้องเรียน
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CheckCircle,
  FileText,
  AlertTriangle,
  Loader2,
  Eye,
  Image as ImageIcon,
  Video,
  Edit,
  UserPlus,
  Trash2
} from "lucide-react";
import { io } from "socket.io-client";
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import StatusTimeline from './StatusTimeline';
import CommentSection from './CommentSection';
import StatusUpdateModal from './StatusUpdateModal';
import AssignmentModal from './AssignmentModal';
import { complaintAPI } from '../../services/complaintAPI';

const API_BASE_URL = 'http://localhost:5000'
const socket = io("http://localhost:5000");

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Mock user data (จะเปลี่ยนเป็นจริงหลัง Auth เสร็จ)
  const currentUser = {
    user_id: localStorage.getItem('user_id') || 'U0000001',
    user_role: localStorage.getItem('user_role') || 'reporter'
  };

  const isStaffOrAdmin = ['staff', 'admin'].includes(currentUser.user_role);
  const isOwner = data?.user_id === currentUser.user_id;

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

    // Socket.IO for real-time views
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
      await fetchComplaint(); // Reload
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

  const attachments = Array.isArray(data.attachments)
  ? data.attachments.map(file => {
      return file.startsWith('http') ? file : `${API_BASE_URL}${file}`;
    })
  : data.attachment
    ? [data.attachment.startsWith('http') ? data.attachment : `${API_BASE_URL}${data.attachment}`]
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

        <div className="bg-white border border-green-100 rounded-3xl shadow-xl overflow-hidden">
          {/* Attachments Section */}
          <div className="w-full bg-gray-50 p-4 flex flex-wrap sm:flex-nowrap gap-4 overflow-x-auto rounded-t-3xl">
            {attachments.length > 0 ? (
              attachments.map((file, index) => {
                const isVideo = file.endsWith(".mp4") || file.endsWith(".mov");
                return (
                  <div
                    key={index}
                    className="w-full sm:w-[250px] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition"
                  >
                    {isVideo ? (
                      <video
                        src={file}
                        controls
                        className="w-full h-56 sm:h-64 object-cover"
                      />
                    ) : (
                      <img
                        src={file}
                        alt={`attachment-${index}`}
                        className="w-full h-56 sm:h-64 object-cover"
                      />
                    )}
                    <div className="flex items-center justify-center gap-2 p-2 text-gray-500 text-sm">
                      {isVideo ? (
                        <>
                          <Video size={16} /> วิดีโอ
                        </>
                      ) : (
                        <>
                          <ImageIcon size={16} /> ภาพ
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-10 text-gray-400">
                <ImageIcon size={40} className="mb-2 text-gray-300" />
                ไม่มีไฟล์แนบ
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-8">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#55C388] mb-2 break-words">
                  {data.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <StatusBadge status={data.current_status} />
                  <PriorityBadge priority={data.priority} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {isStaffOrAdmin && (
                  <>
                    <button
                      onClick={() => setStatusModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                      title="อัปเดตสถานะ"
                    >
                      <Edit size={16} className="sm:size-[18px]" />
                      อัปเดตสถานะ
                    </button>
                    <button
                      onClick={() => setAssignModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
                      title="มอบหมายงาน"
                    >
                      <UserPlus size={16} className="sm:size-[18px]" />
                      มอบหมาย
                    </button>
                  </>
                )}
                {(isOwner || currentUser.user_role === "admin") && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                    title="ลบ"
                  >
                    <Trash2 size={16} className="sm:size-[18px]" />
                    ลบ
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            {data.categories && data.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {data.categories.map((cat, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-gray-700 mb-5 leading-relaxed text-sm sm:text-base break-words">
              {data.description}
            </p>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="text-[#55C388]" size={18} />
                <span>
                  สถานที่: {data.location?.building || data.location}{" "}
                  {data.location?.floor && `ชั้น ${data.location.floor}`}{" "}
                  {data.location?.room && `ห้อง ${data.location.room}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-[#55C388]" size={18} />
                <span>
                  วันที่แจ้ง:{" "}
                  {new Date(data.datetime_reported).toLocaleString("th-TH")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="text-[#55C388]" size={18} />
                <span>ผู้แจ้ง: {data.user_id}</span>
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
        </div>

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
    </div>
  );

}