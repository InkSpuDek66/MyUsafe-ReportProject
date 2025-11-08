// frontend/src/pages/user/EditComplaint.jsx
// หน้าสำหรับแก้ไขเรื่องร้องเรียน (เฉพาะสถานะ "รอรับเรื่อง" เท่านั้น)
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle, Loader2, X } from 'lucide-react';
import { complaintAPI } from '../../services/complaintAPI';
import { categoryAPI } from '../../services/categoryAPI';
import { locationAPI } from '../../services/locationAPI';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditComplaint = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [originalComplaint, setOriginalComplaint] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        categories: [],
        description: '',
        location: {
            building: '',
            floor: '',
            room: ''
        }
    });

    // Options State
    const [categories, setCategories] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);

    // ดึงข้อมูลเรื่องร้องเรียนเดิม
    useEffect(() => {
        fetchComplaint();
        fetchCategories();
        fetchBuildings();
    }, [id]);

    const fetchComplaint = async () => {
        try {
            setLoading(true);
            const response = await complaintAPI.getById(id);
            const complaint = response.data;

            // เช็คว่าสถานะเป็น "รอรับเรื่อง" หรือไม่
            if (complaint.current_status !== 'รอรับเรื่อง') {
                alert('ไม่สามารถแก้ไขได้ เนื่องจากเรื่องร้องเรียนไม่อยู่ในสถานะ "รอรับเรื่อง"');
                navigate(`/complaint/${id}`);
                return;
            }

            // เช็คว่าเป็นเจ้าของหรือไม่
            const currentUserId = localStorage.getItem('user_id');
            if (complaint.user_id !== currentUserId) {
                alert('คุณไม่มีสิทธิ์แก้ไขเรื่องร้องเรียนนี้');
                navigate(`/complaint/${id}`);
                return;
            }

            setOriginalComplaint(complaint);
            setFormData({
                title: complaint.title || '',
                categories: Array.isArray(complaint.categories) ? complaint.categories : [],
                description: complaint.description || '',
                location: {
                    building: complaint.location?.building || '',
                    floor: complaint.location?.floor || '',
                    room: complaint.location?.room || ''
                }
            });

            // ดึงข้อมูล floors และ rooms ตาม location เดิม
            if (complaint.location?.building) {
                fetchFloors(complaint.location.building);
            }
            if (complaint.location?.building && complaint.location?.floor) {
                fetchRooms(complaint.location.building, complaint.location.floor);
            }
        } catch (error) {
            console.error('Error fetching complaint:', error);
            alert('ไม่สามารถโหลดข้อมูลได้');
            navigate('/my-complaints');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getCategories();
            if (response.success && Array.isArray(response.data)) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBuildings = async () => {
        try {
            const response = await locationAPI.getBuildings();
            if (response.success) {
                setBuildings(response.data);
            }
        } catch (error) {
            console.error('Error fetching buildings:', error);
        }
    };

    const fetchFloors = async (building) => {
        try {
            const response = await locationAPI.getFloorsByBuilding(building);
            if (response.success) {
                setFloors(response.data);
            }
        } catch (error) {
            console.error('Error fetching floors:', error);
        }
    };

    const fetchRooms = async (building, floor) => {
        try {
            const response = await locationAPI.getRoomsByBuildingFloor(building, floor);
            if (response.success) {
                setRooms(response.data);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    // Handle form changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLocationChange = async (field, value) => {
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [field]: value
            }
        }));

        // โหลดข้อมูลตามการเลือก
        if (field === 'building') {
            setFormData(prev => ({
                ...prev,
                location: {
                    building: value,
                    floor: '',
                    room: ''
                }
            }));
            setFloors([]);
            setRooms([]);
            if (value) {
                await fetchFloors(value);
            }
        } else if (field === 'floor') {
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    floor: value,
                    room: ''
                }
            }));
            setRooms([]);
            if (value && formData.location.building) {
                await fetchRooms(formData.location.building, value);
            }
        }
    };

    const handleCategoryToggle = (categoryName) => {
        setFormData(prev => {
            const isSelected = prev.categories.includes(categoryName);
            return {
                ...prev,
                categories: isSelected
                    ? prev.categories.filter(c => c !== categoryName)
                    : [...prev.categories, categoryName]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            alert('กรุณากรอกหัวข้อ');
            return;
        }

        if (formData.categories.length === 0) {
            alert('กรุณาเลือกอย่างน้อย 1 หมวดหมู่');
            return;
        }

        if (!formData.location.building || !formData.location.floor) {
            alert('กรุณาเลือกอาคารและชั้น');
            return;
        }

        try {
            setSubmitting(true);

            // สร้าง update data
            const updateData = {
                title: formData.title.trim(),
                categories: formData.categories,
                description: formData.description.trim(),
                location: formData.location,
                action: 'edit' // บอก backend ว่าเป็นการแก้ไข
            };

            await complaintAPI.update(id, updateData);

            alert('แก้ไขเรื่องร้องเรียนสำเร็จ');
            navigate(`/complaint/${id}`);
        } catch (error) {
            console.error('Error updating complaint:', error);
            alert('เกิดข้อผิดพลาดในการแก้ไข: ' + (error.response?.data?.error || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="กำลังโหลดข้อมูล..." />
            </div>
        );
    }

    if (!originalComplaint) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
                    <p className="text-gray-600">ไม่พบข้อมูลเรื่องร้องเรียน</p>
                    <Link to="/my-complaints" className="text-[#55C388] hover:underline mt-2 inline-block">
                        กลับไปหน้ารายการเรื่องร้องเรียน
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to={`/complaint/${id}`}
                        className="inline-flex items-center gap-2 hover:text-[#55C388] mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        กลับไปหน้ารายละเอียด
                    </Link>
                    <h1 className="text-3xl font-bold text-[#55C388]">แก้ไขเรื่องร้องเรียน</h1>
                    <p className="mt-2">รหัสเรื่อง: {originalComplaint.complaint_id}</p>
                </div>

                {/* แจ้งเตือนเกี่ยวกับรูปภาพ */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                        <AlertTriangle className="text-yellow-400 mr-3" size={20} />
                        <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">หมายเหตุ:</p>
                            <p>ไม่สามารถแก้ไขรูปภาพหรือวิดีโอที่แนบมาได้ หากต้องการเปลี่ยนรูป กรุณาลบเรื่องร้องเรียนนี้และส่งเรื่องใหม่</p>
                        </div>
                    </div>
                </div>

                {/* แสดงรูปภาพเดิม */}
                {originalComplaint.images && originalComplaint.images.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3">รูปภาพ/วิดีโอที่แนบมา (ไม่สามารถแก้ไขได้)</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {originalComplaint.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                                    alt={`attachment-${index}`}
                                    className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200"
                                    onError={(e) => {
                                        e.target.src = '/MyUSafe_mini_none-bg_LOGO1.png';
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                    {/* หัวข้อ */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            หัวข้อ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent"
                            placeholder="กรอกหัวข้อเรื่องร้องเรียน"
                            required
                        />
                    </div>

                    {/* หมวดหมู่ */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            หมวดหมู่ <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category._id}
                                    type="button"
                                    onClick={() => handleCategoryToggle(category.name)}
                                    className={`p-3 rounded-lg border-2 transition-all ${formData.categories.includes(category.name)
                                            ? 'border-[#55C388] bg-[#E6F6EE] text-[#55C388]'
                                            : 'border-gray-200 text-gray-700 hover:border-[#55C388]/50'
                                        }`}
                                >
                                    <span className="text-xl mb-1">{category.icon || '📝'}</span>
                                    <p className="text-sm font-medium">{category.name}</p>
                                </button>
                            ))}
                        </div>
                        {formData.categories.length === 0 && (
                            <p className="text-red-500 text-sm mt-2">กรุณาเลือกอย่างน้อย 1 หมวดหมู่</p>
                        )}
                    </div>

                    {/* รายละเอียด */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            รายละเอียด
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={5}
                            className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent resize-none"
                            placeholder="อธิบายรายละเอียดเพิ่มเติม..."
                        />
                    </div>

                    {/* ตำแหน่ง */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ตำแหน่งที่เกิดเหตุ <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* อาคาร */}
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">อาคาร</label>
                                <select
                                    value={formData.location.building}
                                    onChange={(e) => handleLocationChange('building', e.target.value)}
                                    className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent"
                                    required
                                >
                                    <option value="">เลือกอาคาร</option>
                                    {buildings.map((building, index) => (
                                        <option key={index} value={building}>
                                            {building}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ชั้น */}
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">ชั้น</label>
                                <select
                                    value={formData.location.floor}
                                    onChange={(e) => handleLocationChange('floor', e.target.value)}
                                    className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent"
                                    disabled={!formData.location.building}
                                    required
                                >
                                    <option value="">เลือกชั้น</option>
                                    {floors.map((floor, index) => (
                                        <option key={index} value={floor}>
                                            {floor}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ห้อง */}
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">ห้อง (ถ้ามี)</label>
                                <select
                                    value={formData.location.room}
                                    onChange={(e) => handleLocationChange('room', e.target.value)}
                                    className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent"
                                    disabled={!formData.location.floor}
                                >
                                    <option value="">เลือกห้อง</option>
                                    {rooms.map((room, index) => (
                                        <option key={index} value={room}>
                                            {room}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ปุ่ม Submit */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate(`/complaint/${id}`)}
                            disabled={submitting}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    บันทึกการแก้ไข
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditComplaint;