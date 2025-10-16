// frontend/src/components/complaints/ComplaintForm.jsx
// Component สำหรับฟอร์มสร้างเรื่องร้องเรียนใหม่
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Check } from 'lucide-react';
import LocationSelector from './LocationSelector';
import ImageUploader from './ImageUploader';
import { complaintAPI } from '../../services/complaintAPI';

const ComplaintForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]); // State สำหรับ multiple categories
    const navigate = useNavigate();

    // Mock categories data (ในอนาคตจะดึงจาก API)
    const categories = [
        { id: 'flood', name: 'น้ำท่วม', icon: '💧' },
        { id: 'electrical', name: 'ไฟฟ้า', icon: '⚡' },
        { id: 'computer', name: 'คอมพิวเตอร์/เว็บไซต์', icon: '💻' },
        { id: 'plumbing', name: 'ประปา/ท่อน้ำ', icon: '🚰' },
        { id: 'facilities', name: 'สิ่งอำนวยความสะดวก', icon: '🏢' },
        { id: 'cleanliness', name: 'ความสะอาด', icon: '🧹' },
        { id: 'safety', name: 'ความปลอดภัย', icon: '🚨' },
        { id: 'other', name: 'อื่นๆ', icon: '📝' }
    ];

    // Handle category selection (toggle)
    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                // ถ้าเลือกไว้แล้ว ให้ลบออก
                return prev.filter(id => id !== categoryId);
            } else {
                // ถ้ายังไม่เลือก ให้เพิ่มเข้าไป
                return [...prev, categoryId];
            }
        });
    };

    const onSubmit = async (data) => {
        // Validate categories
        if (selectedCategories.length === 0) {
            setSubmitError('กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            setLoading(true);
            setSubmitError('');

            const formData = new FormData();

            // Append text fields
            formData.append('title', data.title);
            formData.append('description', data.description);
            
            // Append multiple categories as JSON array
            formData.append('categories', JSON.stringify(selectedCategories));
            
            // Priority จะถูกตั้งค่าเป็น 'low' โดยอัตโนมัติที่ Backend
            // เฉพาะ Staff/Admin เท่านั้นที่สามารถแก้ไข priority ได้

            // Append location as JSON string
            formData.append('location', JSON.stringify({
                building: data.building,
                floor: data.floor,
                room: data.room || ''
            }));

            // Append image files
            files.forEach(file => {
                formData.append('images', file);
            });

            // Call API using complaintAPI service
            const response = await complaintAPI.create(formData);

            if (response.success) {
                // Show success message
                alert('✅ สร้างเรื่องร้องเรียนสำเร็จ');
                
                // Navigate to complaint detail page
                navigate(`/complaint/${response.data._id || response.data.complaint_id}`);
            }
        } catch (error) {
            console.error('Error submitting complaint:', error);
            
            // Set error message
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง';
            setSubmitError(errorMessage);
            
            // Scroll to top to show error
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen  py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 hover:text-[#55C388] mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">ย้อนกลับ</span>
                </button>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#55C388] to-[#43A874] px-8 py-6">
                        <h2 className="text-2xl font-bold text-white">
                            แจ้งเรื่องร้องเรียน
                        </h2>
                        <p className="text-white/90 mt-1">
                            กรุณากรอกข้อมูลให้ครบถ้วนเพื่อให้เราสามารถช่วยเหลือคุณได้อย่างรวดเร็ว
                        </p>
                    </div>

                    {/* Error Alert */}
                    {submitError && (
                        <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <div className="flex-1">
                                <h4 className="font-semibold text-red-900 mb-1">
                                    เกิดข้อผิดพลาด
                                </h4>
                                <p className="text-sm text-red-700">
                                    {submitError}
                                </p>
                            </div>
                            <button
                                onClick={() => setSubmitError('')}
                                className="text-red-400 hover:text-red-600"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                        {/* Title Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                หัวข้อเรื่อง <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register('title', {
                                    required: 'กรุณากรอกหัวข้อเรื่อง',
                                    minLength: { 
                                        value: 5, 
                                        message: 'หัวข้อต้องมีความยาวอย่างน้อย 5 ตัวอักษร' 
                                    },
                                    maxLength: {
                                        value: 100,
                                        message: 'หัวข้อต้องไม่เกิน 100 ตัวอักษร'
                                    }
                                })}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent transition-all text-gray-600 ${
                                    errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="เช่น: น้ำรั่วในห้องน้ำชั้น 2"
                            />
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        {/* Category Field - Multi-Select */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                หมวดหมู่ <span className="text-red-500">*</span>
                                <span className="text-xs font-normal text-gray-500 ml-2">
                                    (เลือกได้มากกว่า 1 หมวดหมู่)
                                </span>
                            </label>
                            
                            {/* Selected Categories Counter */}
                            {selectedCategories.length > 0 && (
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#55C388] text-white">
                                        เลือกแล้ว {selectedCategories.length} หมวดหมู่
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategories([])}
                                        className="text-xs text-gray-500 hover:text-red-600 underline"
                                    >
                                        ล้างทั้งหมด
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {categories.map(category => {
                                    const isSelected = selectedCategories.includes(category.id);
                                    
                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => handleCategoryToggle(category.id)}
                                            className={`relative flex flex-col items-center p-4 border-2 rounded-lg transition-all hover:border-[#55C388] hover:shadow-md ${
                                                isSelected
                                                    ? 'border-[#55C388] bg-green-50 shadow-md'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            {/* Checkmark Badge */}
                                            {isSelected && (
                                                <div className="absolute -top-2 -right-2 bg-[#55C388] rounded-full p-1 shadow-md">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                            
                                            <span className="text-3xl mb-2">{category.icon}</span>
                                            <span className={`text-xs text-center font-medium ${
                                                isSelected ? 'text-[#55C388]' : 'text-gray-700'
                                            }`}>
                                                {category.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Error message for categories */}
                            {selectedCategories.length === 0 && submitError && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่
                                </p>
                            )}

                            {/* Info text */}
                            <p className="mt-3 text-xs text-gray-500">
                                💡 เลือกหมวดหมู่ที่เกี่ยวข้องกับปัญหาของคุณเพื่อให้เจ้าหน้าที่สามารถดำเนินการได้อย่างรวดเร็ว
                            </p>
                        </div>

                        {/* Location Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                สถานที่ <span className="text-red-500">*</span>
                            </label>
                            <LocationSelector
                                register={register}
                                errors={errors}
                                setValue={setValue}
                            />
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                รายละเอียด <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                {...register('description', {
                                    required: 'กรุณากรอกรายละเอียด',
                                    minLength: { 
                                        value: 10, 
                                        message: 'รายละเอียดต้องมีความยาวอย่างน้อย 10 ตัวอักษร' 
                                    },
                                    maxLength: {
                                        value: 5000,
                                        message: 'รายละเอียดต้องไม่เกิน 5000 ตัวอักษร'
                                    }
                                })}
                                rows={5}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent transition-all resize-none text-gray-600 ${
                                    errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="โปรดอธิบายปัญหาอย่างละเอียด เช่น อาการ, ความรุนแรง, เวลาที่เกิดขึ้น เป็นต้น"
                            />
                            <div className="flex justify-between items-center mt-2">
                                {errors.description ? (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.description.message}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500">
                                        💡 ยิ่งให้รายละเอียดมาก เราจะสามารถช่วยเหลือคุณได้เร็วขึ้น
                                    </p>
                                )}
                                <span className="text-xs text-gray-500">
                                    {watch('description')?.length || 0} / 5000
                                </span>
                            </div>
                        </div>

                        {/* Image Uploader */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ไฟล์แนบ (รูปภาพหรือวิดีโอ)
                            </label>
                            <p className="text-xs text-gray-600 mb-3">
                                📸 เพิ่มรูปภาพหรือวิดีโอเพื่อให้เราเห็นปัญหาได้ชัดเจนยิ่งขึ้น
                            </p>
                            <ImageUploader
                                files={files}
                                setFiles={setFiles}
                                maxFiles={5}
                                maxSize={20 * 1024 * 1024}
                            />
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200"></div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
                                disabled={loading}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-[#55C388] to-[#43A874] text-white rounded-lg font-semibold hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#55C388] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        กำลังส่งข้อมูล...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        ส่งเรื่องร้องเรียน
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                                ℹ️ หมายเหตุ
                            </h4>
                            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                                <li>เรื่องร้องเรียนของคุณจะได้รับการตอบกลับภายใน 1-2 วันทำการ</li>
                                <li>คุณสามารถติดตามสถานะได้ที่เมนู "เรื่องร้องเรียนของฉัน"</li>
                                <li>ระดับความสำคัญจะถูกประเมินโดยเจ้าหน้าที่อัตโนมัติ</li>
                                <li>การเลือกหมวดหมู่ที่ถูกต้องจะช่วยให้เจ้าหน้าที่ดำเนินการได้รวดเร็วขึ้น</li>
                            </ul>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="mt-6 text-center text-sm">
                    <p>
                        ต้องการความช่วยเหลือ? ติดต่อเราที่{' '}
                        <a href="mailto:support@university.ac.th" className="text-[#55C388] hover:underline font-medium">
                            support@university.ac.th
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ComplaintForm;