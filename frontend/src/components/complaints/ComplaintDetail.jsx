// frontend/src/pages/ComplaintDetail/ComplaintDetail.jsx
// หน้าแสดงรายละเอียดเรื่องร้องเรียน
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// import { motion } from "framer-motion";
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
} from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ComplaintDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${id}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error loading complaint:", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchComplaint();

    socket.emit("view_complaint", id);
    socket.on("update_views", (data) => {
      if (data.id === id) {
        setData((prev) => ({ ...prev, views: data.views }));
      }
    });
    return () => socket.off("update_views");
  }, [id]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "รอดำเนินการ":
        return "text-yellow-600 bg-yellow-100";
      case "กำลังดำเนินการ":
        return "text-blue-600 bg-blue-100";
      case "เสร็จสิ้น":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const attachments = Array.isArray(data.attachments)
    ? data.attachments
    : data.attachment
    ? [data.attachment]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#55C388] hover:underline mb-6"
        >
          <ArrowLeft size={18} /> กลับหน้าหลัก
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-green-100 rounded-3xl shadow-xl overflow-hidden"
        >
          {/* 🔹 ส่วนแสดงไฟล์แนบ (ภาพ/วิดีโอ) */}
          <div className="w-full bg-gray-50 p-4 flex gap-4 overflow-x-auto rounded-t-3xl scrollbar-thin scrollbar-thumb-green-200">
            {attachments.length > 0 ? (
              attachments.map((file, index) => {
                const isVideo = file.endsWith(".mp4") || file.endsWith(".mov");
                return (
                  <motion.div
                    key={index}
                    className="min-w-[250px] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition"
                    whileHover={{ scale: 1.03 }}
                  >
                    {isVideo ? (
                      <video
                        src={file}
                        controls
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <img
                        src={file}
                        alt={`attachment-${index}`}
                        className="w-full h-64 object-cover"
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
                  </motion.div>
                );
              })
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-10 text-gray-400">
                <ImageIcon size={40} className="mb-2 text-gray-300" />
                ไม่มีไฟล์แนบ
              </div>
            )}
          </div>

          {/* 🔹 เนื้อหา */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-3xl font-bold text-[#55C388]">
                {data.title}
              </h1>
              <div className="flex items-center gap-1 text-gray-500">
                <Eye size={18} />
                <span className="text-sm">{data.views || 0}</span>
              </div>
            </div>

            <p className="text-gray-700 mb-5 leading-relaxed">
              {data.description}
            </p>

            {/* 🔹 ข้อมูลทั่วไป */}
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="text-[#55C388]" size={18} />
                <span>สถานที่: {data.location}</span>
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
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium ${getStatusColor(
                  data.current_status
                )}`}
              >
                <CheckCircle size={18} />
                <span>{data.current_status}</span>
              </div>
            </div>

            {/* 🔹 ประวัติสถานะ */}
            <div className="mt-8 border-t border-green-100 pt-6">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <FileText className="text-[#55C388]" size={20} /> ประวัติสถานะ
              </h3>

              <div className="relative border-l-4 border-[#55C388]/30 ml-3">
                {data.status_history?.length > 0 ? (
                  data.status_history.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="ml-5 mb-5 relative"
                    >
                      <div className="w-3 h-3 bg-[#55C388] rounded-full absolute -left-1.5 top-1.5 shadow-md" />
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100 shadow-sm">
                        <p className="font-medium text-gray-700">
                          {s.status_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(s.updated_at).toLocaleString("th-TH")}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm ml-4">
                    ยังไม่มีข้อมูลสถานะเพิ่มเติม
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <footer className="text-center text-gray-400 text-sm mt-10">
          © 2025 ระบบรายงานปัญหามหาวิทยาลัย — Powered by Traffy Style 💚
        </footer>
      </div>
    </div>
  );
}
