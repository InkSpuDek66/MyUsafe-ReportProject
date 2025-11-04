import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AVAILABLE_ICONS = [
  { emoji: '💧', name: 'น้ำ' },
  { emoji: '🔧', name: 'ซ่อมแซม' },
  { emoji: '💡', name: 'ไฟฟ้า' },
  { emoji: '🚪', name: 'ประตู' },
  { emoji: '🪟', name: 'หน้าต่าง' },
  { emoji: '🚽', name: 'ห้องน้ำ' },
  { emoji: '❄️', name: 'แอร์' },
  { emoji: '🌡️', name: 'อุณหภูมิ' },
  { emoji: '📶', name: 'อินเทอร์เน็ต' },
  { emoji: '🔒', name: 'ความปลอดภัย' },
  { emoji: '🗑️', name: 'ขยะ' },
  { emoji: '🌳', name: 'ต้นไม้/สวน' },
  { emoji: '🚗', name: 'จอดรถ' },
  { emoji: '🏃', name: 'กีฬา' },
  { emoji: '📚', name: 'ห้องสมุด' },
  { emoji: '🍽️', name: 'โรงอาหาร' },
  { emoji: '🔊', name: 'เสียง' },
  { emoji: '🎨', name: 'งานศิลป์' },
  { emoji: '⚠️', name: 'เตือน' },
  { emoji: '📋', name: 'อื่นๆ' }
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📋'
    // auto_assign_dept: '',  // คอมเมนต์ออก
    // is_active: true        // คอมเมนต์ออก
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      showNotification('ไม่สามารถโหลดข้อมูลได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ✅ เพิ่มฟังก์ชัน validateForm() ที่ขาดหายไป
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณาระบุชื่อหมวดหมู่';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const url = editingCategory
        ? `${API_URL}/categories/${editingCategory._id}`
        : `${API_URL}/categories`;
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification(
          editingCategory ? 'แก้ไขหมวดหมู่สำเร็จ' : 'เพิ่มหมวดหมู่สำเร็จ',
          'success'
        );
        fetchCategories();
        closeModal();
      } else {
        showNotification(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (error) {
      showNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/categories/${deletingCategory._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        showNotification('ลบหมวดหมู่สำเร็จ', 'success');
        fetchCategories();
      } else {
        showNotification(data.error || 'ไม่สามารถลบหมวดหมู่ได้', 'error');
      }
    } catch (error) {
      showNotification('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    } finally {
      setShowDeleteModal(false);
      setDeletingCategory(null);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '📋'
      // auto_assign_dept: '',  // คอมเมนต์ออก
      // is_active: true        // คอมเมนต์ออก
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📋'
      // auto_assign_dept: category.auto_assign_dept || '',  // คอมเมนต์ออก
      // is_active: category.is_active !== false             // คอมเมนต์ออก
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '📋'
      // auto_assign_dept: '',  // คอมเมนต์ออก
      // is_active: true        // คอมเมนต์ออก
    });
    setErrors({});
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#55C388] mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            จัดการหมวดหมู่เรื่องร้องเรียน
          </h1>
          <p className="text-gray-600">
            เพิ่ม แก้ไข หรือลบหมวดหมู่เรื่องร้องเรียนในระบบ
          </p>
        </div>

        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาหมวดหมู่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent"
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#55C388] hover:bg-[#4ab378] text-white px-6 py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <PlusIcon className="w-5 h-5" />
              เพิ่มหมวดหมู่
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{category.icon || '📋'}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      {/* ส่วนแสดงสถานะถูกคอมเมนต์ออก */}
                      {/* <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        category.is_active !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.is_active !== false ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span> */}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[40px]">
                  {category.description || 'ไม่มีคำอธิบาย'}
                </p>

                {/* ส่วนแสดงหน่วยงานรับผิดชอบถูกคอมเมนต์ออก */}
                {/* <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">หน่วยงานรับผิดชอบ:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {category.auto_assign_dept || 'ไม่ระบุ'}
                  </p>
                </div> */}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <PencilIcon className="w-4 h-4" />
                    แก้ไข
                  </button>
                  <button
                    onClick={() => {
                      setDeletingCategory(category);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">ไม่พบหมวดหมู่</p>
          </div>
        )}

        {/* Modal สำหรับเพิ่ม/แก้ไขหมวดหมู่ */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกไอคอน <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {AVAILABLE_ICONS.map((iconObj) => (
                      <button
                        key={iconObj.emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconObj.emoji })}
                        className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                          formData.icon === iconObj.emoji
                            ? 'border-[#55C388] bg-green-50 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={iconObj.name}
                      >
                        {iconObj.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อหมวดหมู่ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="เช่น น้ำท่วม, ไฟฟ้าขัดข้อง"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent"
                    placeholder="อธิบายรายละเอียดของหมวดหมู่นี้"
                  />
                </div>

                {/* ส่วนเลือกหน่วยงานรับผิดชอบถูกคอมเมนต์ออก */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หน่วยงานรับผิดชอบ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.auto_assign_dept}
                    onChange={(e) => setFormData({ ...formData, auto_assign_dept: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent ${
                      errors.auto_assign_dept ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">เลือกหน่วยงาน</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.auto_assign_dept && (
                    <p className="mt-1 text-sm text-red-500">{errors.auto_assign_dept}</p>
                  )}
                </div> */}

                {/* ส่วน Checkbox เปิดใช้งานถูกคอมเมนต์ออก */}
                {/* <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#55C388] border-gray-300 rounded focus:ring-[#55C388]"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    เปิดใช้งานหมวดหมู่นี้
                  </label>
                </div> */}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-[#55C388] hover:bg-[#4ab378] text-white rounded-lg transition-colors"
                  >
                    {editingCategory ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal ยืนยันการลบ */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    ยืนยันการลบ
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{deletingCategory?.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {deletingCategory?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {deletingCategory?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingCategory(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  ลบหมวดหมู่
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}