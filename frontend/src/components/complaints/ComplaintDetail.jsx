import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CheckCircle,
  FileText,
  AlertTriangle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ComplaintDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ หมวดหมู่หลัก (เหมือนใน Home.jsx)
  const categories = [
    { id: "flood", name: "น้ำท่วม", icon: "💧" },
    { id: "electrical", name: "ไฟฟ้า", icon: "⚡" },
    { id: "computer", name: "คอมพิวเตอร์/เว็บไซต์", icon: "💻" },
    { id: "plumbing", name: "ประปา/ท่อน้ำ", icon: "🚰" },
    { id: "facilities", name: "สิ่งอำนวยความสะดวก", icon: "🏢" },
    { id: "cleanliness", name: "ความสะอาด", icon: "🧹" },
    { id: "safety", name: "ความปลอดภัย", icon: "🚨" },
    { id: "other", name: "อื่นๆ", icon: "📝" },
  ];

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${id}`);
      const json = await res.json();
      setData(json.data || json);
    } catch (err) {
      console.error("❌ Error loading complaint:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchComplaint();
    socket.emit("view_complaint", id);
    socket.on("update_views", (d) => {
      if (d.id === id) setData((prev) => ({ ...prev, views: d.views }));
    });
    return () => socket.off("update_views");
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "รอรับเรื่อง":
        return "bg-yellow-100 text-yellow-700";
      case "ดำเนินการ":
      case "กำลังดำเนินการ":
        return "bg-blue-100 text-blue-700";
      case "เสร็จสิ้น":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const nextMedia = () => {
    if (!data?.attachments?.length) return;
    setCurrentIndex((prev) => (prev + 1) % data.attachments.length);
  };

  const prevMedia = () => {
    if (!data?.attachments?.length) return;
    setCurrentIndex(
      (prev) => (prev - 1 + data.attachments.length) % data.attachments.length
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-[#55C388]">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        <AlertTriangle className="text-yellow-500 mr-2" /> ไม่พบข้อมูลเรื่องร้องเรียน
      </div>
    );

  const attachments = data.attachments || [];
  const currentFile = attachments[currentIndex];
  const cates = Array.isArray(data.categories)
    ? data.categories
    : data.categories
    ? [data.categories]
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
          className="bg-white border border-green-100 rounded-3xl shadow-lg overflow-hidden"
        >
          {/* ✅ ตัวเลื่อนภาพ/วิดีโอ */}
          <div className="relative bg-gray-50 flex justify-center items-center h-96">
            {attachments.length > 0 ? (
              <>
                {currentFile.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={`http://localhost:5000${currentFile}`}
                    controls
                    className="rounded-xl w-full h-full object-contain cursor-pointer"
                  />
                ) : (
                  <img
                    src={`http://localhost:5000${currentFile}`}
                    alt={`attachment-${currentIndex}`}
                    onClick={() =>
                      setPreviewMedia(`http://localhost:5000${currentFile}`)
                    }
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
                          className={`w-2 h-2 rounded-full ${
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
              <img
                src="/MyUSafe_mini_none-bg_LOGO1.png"
                alt="default"
                className="w-full h-full object-contain bg-gray-50"
              />
            )}
          </div>

          {/* ✅ เนื้อหาหลัก */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-[#55C388]">{data.title}</h1>
              <div className="flex items-center text-gray-500 gap-1">
                <Eye size={18} />
                <span className="text-sm">{data.views || 0}</span>
              </div>
            </div>

            <p className="text-gray-700 mb-5 leading-relaxed">
              {data.description}
            </p>

            {/* ✅ หมวดหมู่ */}
            {cates.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
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

            {/* ✅ ข้อมูลทั่วไป */}
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
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
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium ${getStatusColor(
                  data.current_status
                )}`}
              >
                <CheckCircle size={18} />
                <span>{data.current_status}</span>
              </div>
            </div>

            {/* ✅ ประวัติสถานะ */}
            <div className="mt-8 border-t border-green-100 pt-6">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <FileText className="text-[#55C388]" size={20} /> ประวัติสถานะ
              </h3>

              <div className="relative border-l-4 border-[#55C388]/30 ml-3">
                {data.status_history && data.status_history.length > 0 ? (
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
      </div>

      {/* ✅ Popup แสดงรูปเต็มจอ */}
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
