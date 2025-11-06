import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FunnelIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import * as XLSX from "xlsx";

export default function ComplaintsListManagement() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [staffList, setStaffList] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ เปลี่ยนจาก hardcode เป็นดึงจาก DB
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [currentAdmin, setCurrentAdmin] = useState(null); // ✅ เพิ่มข้อมูล Admin ปัจจุบัน

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    loadData();
    loadStaffList();
    loadCategories(); // ✅ เพิ่มการโหลด categories
    loadCurrentAdmin(); // ✅ เพิ่มการโหลดข้อมูล admin
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/api/complaints`);
      const json = await res.json();
      const data = json.success ? json.data : json;
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  const loadStaffList = async () => {
    try {
      const res = await fetch(`${API}/api/assignments/staff`);
      const json = await res.json();
      if (json.success) {
        setStaffList(json.data);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  // ✅ เพิ่มฟังก์ชันโหลด categories จาก DB
  const loadCategories = async () => {
    try {
      const res = await fetch(`${API}/api/categories`);
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // ✅ เพิ่มฟังก์ชันโหลดข้อมูล Admin ปัจจุบัน
  const loadCurrentAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        console.error('No token or userId found');
        return;
      }

      const res = await fetch(`${API}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const json = await res.json();
      if (json.success) {
        setCurrentAdmin(json.data);
        console.log('Current admin loaded:', json.data);
      }
    } catch (err) {
      console.error('Error fetching current admin:', err);
    }
  };

  // ✅ แก้ไข toggleCategory ให้ใช้ name แทน id
  const toggleCategory = (name) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        if (filterStatus !== "ทั้งหมด" && c.current_status !== filterStatus)
          return false;
        // ✅ แก้ไขการ filter ตาม category name
        if (selectedCategories.length > 0) {
          const cates = Array.isArray(c.categories) ? c.categories : [];
          if (!selectedCategories.some((name) => cates.includes(name))) return false;
        }
        if (searchQuery && searchQuery.trim() !== "") {
          const q = searchQuery.trim().toLowerCase();
          const inTitle = (c.title || "").toLowerCase().includes(q);
          const inId = (c.complaint_id || "").toLowerCase().includes(q);
          const inCategory = (c.categories || []).join(" ").toLowerCase().includes(q);
          return inTitle || inId || inCategory;
        }
        return true;
      })
      .sort((a, b) => new Date(b.datetime_reported) - new Date(a.datetime_reported));
  }, [complaints, filterStatus, selectedCategories, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = itemsPerPage === -1
    ? filteredComplaints
    : filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = itemsPerPage === -1
    ? 1
    : Math.ceil(filteredComplaints.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, selectedCategories, searchQuery]);

  const statusBadgeClass = (s) => {
    if (s === "รอรับเรื่อง") return "bg-yellow-100 text-black";
    if (s === "กำลังดำเนินการ") return "bg-blue-100 text-black";
    if (s === "เสร็จสิ้น") return "bg-green-100 text-black";
    if (s === "ยกเลิก") return "bg-gray-200 text-black";
    return "bg-gray-100 text-black";
  };

  // ✅ แก้ไขให้ส่ง token และ userId จริง
  const handleStatusChange = async (id, newStatus) => {
    if (!confirm(`ยืนยันเปลี่ยนสถานะเป็น "${newStatus}" ?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const res = await fetch(`${API}/api/complaints/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          updated_by: userId || "system",
        }),
      });

      if (res.ok) {
        await loadData();
        alert("เปลี่ยนสถานะเรียบร้อยแล้ว");
      } else {
        alert("เปลี่ยนสถานะไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Error changing status:", err);
      alert("เกิดข้อผิดพลาดระหว่างเปลี่ยนสถานะ");
    }
  };

  // ✅ แก้ไขให้ส่ง token และ userId จริง
  const handlePriorityChange = async (id, newPriority) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const res = await fetch(`${API}/api/complaints/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          priority: newPriority,
          updated_by: userId || "system",
        }),
      });

      if (res.ok) {
        await loadData();
        alert("อัปเดตความสำคัญเรียบร้อยแล้ว");
      } else {
        alert("อัปเดตไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Error updating priority:", err);
      alert("เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  // ✅ แก้ไขให้บันทึก admin ID จริง
  const handleAssign = async () => {
    if (!selectedStaffId) {
      alert('กรุณาเลือกเจ้าหน้าที่');
      return;
    }

    if (!currentAdmin || !currentAdmin._id) {
      alert('ไม่พบข้อมูล Admin กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      console.log('Assigning with:', {
        complaint_id: selectedComplaintId,
        assigned_to: selectedStaffId,
        assigned_by: currentAdmin._id
      });

      const res = await fetch(`${API}/api/assignments/${selectedComplaintId}/assign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assigned_to: selectedStaffId,
          assigned_by: currentAdmin._id // ✅ ส่ง ObjectId ของ Admin จริง
        })
      });

      const data = await res.json();

      if (res.ok) {
        await loadData();
        setShowAssignModal(false);
        setSelectedComplaintId(null);
        setSelectedStaffId('');
        alert('มอบหมายงานสำเร็จ');
      } else {
        console.error('Assignment failed:', data);
        alert(data.error || 'มอบหมายงานไม่สำเร็จ');
      }
    } catch (err) {
      console.error('Error assigning:', err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleRowClick = (complaintId) => {
    navigate(`/complaint/${complaintId}`);
  };

  const exportData = (type) => {
    const dataToExport = filteredComplaints.map((c) => ({
      ID: c.complaint_id,
      หัวข้อ: c.title,
      หมวดหมู่: (c.categories || []).join(", "),
      สถานะ: c.current_status,
      วันที่แจ้ง: new Date(c.datetime_reported).toLocaleString("th-TH"),
      ความสำคัญ: c.priority || 'low',
      เจ้าหน้าที่รับผิดชอบ: c.assigned_to ? staffList.find(s => s._id === c.assigned_to)?.name || c.assigned_to : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Complaints");

    if (type === "csv") {
      XLSX.writeFile(wb, "complaints_list.csv", { bookType: "csv" });
    } else {
      XLSX.writeFile(wb, "complaints_list.xlsx");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen" style={{ color: "#000" }}>
      <h1 className="text-3xl font-extrabold text-center mb-8 text-[#55C388] drop-shadow-md">
        จัดการรายการเรื่องร้องเรียน
      </h1>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {["ทั้งหมด", "รอรับเรื่อง", "กำลังดำเนินการ", "เสร็จสิ้น", "ยกเลิก"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                filterStatus === s
                  ? "bg-[#55C388] text-white border-[#55C388]"
                  : "border-[#55C388] text-[#55C388] hover:bg-[#55C388]/10"
              }`}
            >
              {s}
            </button>
          ))}

          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-[#55C388] text-white rounded-lg shadow hover:bg-[#43A874] transition"
          >
            <FunnelIcon className="h-5 w-5" /> หมวดหมู่
          </button>

          <button
            onClick={() => {
              setFilterStatus("ทั้งหมด");
              setSelectedCategories([]);
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] transition flex items-center gap-1"
          >
            <ArrowPathIcon className="h-4 w-4" /> รีเซ็ต
          </button>

          {/* Search box */}
          <div className="ml-auto flex items-center gap-2 relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา ID/หัวข้อ/หมวดหมู่"
              className="pl-10 pr-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#55C388] text-[#55C388]"
            />
          </div>
        </div>

        {/* Category Menu - ✅ ใช้ข้อมูลจาก DB */}
        {showCategoryMenu && (
          <div className="flex flex-wrap justify-center gap-3 mb-6 bg-white border border-green-200 rounded-2xl p-4 shadow-md">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => toggleCategory(cat.name)}
                className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all ${
                  selectedCategories.includes(cat.name)
                    ? "bg-[#55C388] text-white border-[#55C388]"
                    : "border-[#55C388] text-[#55C388] hover:bg-[#55C388]/10"
                }`}
              >
                <span>{cat.icon || '📋'}</span> {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Items per page and Export */}
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">แสดง</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#55C388] text-[#55C388]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>ทั้งหมด</option>
            </select>
            <span className="text-sm text-gray-600">รายการ</span>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => exportData("csv")}
              className="flex items-center gap-2 px-3 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874]"
            >
              <ArrowDownTrayIcon className="h-5 w-5" /> CSV
            </button>
            <button
              onClick={() => exportData("xlsx")}
              className="flex items-center gap-2 px-3 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874]"
            >
              <ArrowDownTrayIcon className="h-5 w-5" /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border border-green-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#55C388]">รายการเรื่องร้องเรียน</h2>
          <div className="text-sm text-gray-600">ทั้งหมด {filteredComplaints.length} รายการ</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse" style={{ color: "#000" }}>
            <thead className="bg-green-50 border-b border-green-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">หัวข้อ</th>
                <th className="px-4 py-2">หมวดหมู่</th>
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2">วันที่แจ้ง</th>
                <th className="px-4 py-2">จัดการ</th>
                <th className="px-4 py-2">ความสำคัญ</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((c) => (
                  <tr 
                    key={c.complaint_id} 
                    className="border-b hover:bg-green-50 transition cursor-pointer"
                    onClick={() => handleRowClick(c.complaint_id)}
                  >
                    <td className="px-4 py-2 align-top">{c.complaint_id}</td>
                    <td className="px-4 py-2 align-top font-medium">{c.title}</td>

                    {/* ✅ แก้ไขการแสดง category ให้ใช้ข้อมูลจาก DB */}
                    <td className="px-4 py-2 align-top">
                      <div className="flex flex-wrap gap-1">
                        {(c.categories || []).map((catName, i) => {
                          const categoryInfo = categories.find(category => category.name === catName);
                          
                          return (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs rounded-full flex items-center gap-1"
                              style={{
                                background: "#F0FDF4",
                                color: "#064E3B",
                                border: "1px solid rgba(0,0,0,0.04)",
                              }}
                            >
                              {categoryInfo && <span>{categoryInfo.icon}</span>}
                              <span>{catName}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-4 py-2 align-top">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(
                          c.current_status
                        )}`}
                        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        {c.current_status}
                      </span>
                    </td>

                    <td className="px-4 py-2 align-top">
                      <div style={{ color: "#000" }}>
                        {new Date(c.datetime_reported).toLocaleString("th-TH")}
                      </div>
                    </td>

                    <td className="px-4 py-2 align-top" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-2">
                        {!c.assigned_to && c.current_status !== 'เสร็จสิ้น' && c.current_status !== 'ยกเลิก' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaintId(c.complaint_id);
                              setShowAssignModal(true);
                            }}
                            className="px-3 py-1.5 bg-[#55C388] text-white rounded-md text-sm hover:bg-[#43A874] flex items-center gap-1 justify-center"
                          >
                            <UserGroupIcon className="h-4 w-4" />
                            มอบหมาย
                          </button>
                        )}

                        {c.current_status !== 'เสร็จสิ้น' && c.current_status !== 'ยกเลิก' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(c.complaint_id, "ยกเลิก");
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                          >
                            ยกเลิก
                          </button>
                        )}

                        {c.assigned_to && c.current_status !== 'เสร็จสิ้น' && c.current_status !== 'ยกเลิก' && (
                          <div className="text-xs text-gray-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                            <UserGroupIcon className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-600 font-medium">มอบหมายแล้ว</span>
                          </div>
                        )}

                        {(c.current_status === "เสร็จสิ้น" || c.current_status === "ยกเลิก") && (
                          <div className="text-sm text-gray-500 italic">-</div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-2 align-top" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={c.priority || "low"}
                        onChange={(e) => {
                          e.stopPropagation();
                          handlePriorityChange(c.complaint_id, e.target.value);
                        }}
                        className="border border-green-200 rounded-lg px-2 py-1 text-sm text-[#55C388] focus:outline-none focus:ring-2 focus:ring-[#55C388]"
                        disabled={c.current_status === 'เสร็จสิ้น' || c.current_status === 'ยกเลิก'}
                      >
                        <option value="low">ต่ำ</option>
                        <option value="medium">ปานกลาง</option>
                        <option value="high">สูง</option>
                        <option value="urgent">ด่วนมาก</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลเรื่องร้องเรียน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {itemsPerPage !== -1 && totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-green-100">
            <div className="text-sm text-gray-600">
              แสดง {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredComplaints.length)} จาก {filteredComplaints.length} รายการ
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#55C388] text-white hover:bg-[#43A874]'
                }`}
              >
                ก่อนหน้า
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === i + 1
                        ? 'bg-[#55C388] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#55C388] text-white hover:bg-[#43A874]'
                }`}
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal - ✅ แสดงข้อมูล Admin */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserGroupIcon className="h-6 w-6 text-[#55C388]" />
              เลือกเจ้าหน้าที่
            </h3>

            {currentAdmin && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">มอบหมายโดย:</p>
                <p className="font-medium text-gray-800">{currentAdmin.name}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เจ้าหน้าที่
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:outline-none"
              >
                <option value="">-- เลือกเจ้าหน้าที่ --</option>
                {staffList.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAssign}
                className="flex-1 px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] font-medium"
              >
                ยืนยัน
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedComplaintId(null);
                  setSelectedStaffId('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}