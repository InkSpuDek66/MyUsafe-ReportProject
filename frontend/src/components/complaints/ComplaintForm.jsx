// frontend/src/components/complaints/ComplaintForm.jsx
// Component สำหรับฟอร์มสร้างเรื่องร้องเรียนใหม่
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Check } from 'lucide-react';
import LocationSelector from './LocationSelector';
import ImageUploader from './ImageUploader';
import { complaintAPI } from '../../services/complaintAPI';
import { categoryAPI } from '../../services/categoryAPI';

const ComplaintForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState([]); // เปลี่ยนจาก mock data เป็น state
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categoriesError, setCategoriesError] = useState(''); // เพิ่ม error state
    const navigate = useNavigate();

    // ฟังก์ชันดึง userId จริงจาก localStorage
    const getCurrentUserId = () => {
        return localStorage.getItem('userId') || 
               localStorage.getItem('user_id') || 
               'U0000001'; // fallback
    };

    // ดึงข้อมูล categories จาก API เมื่อ component โหลด
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                setCategoriesError('');
                const response = await categoryAPI.getCategories();
                
                if (response.success && response.data && response.data.length > 0) {
                    // แปลงข้อมูลจาก API ให้เป็นรูปแบบที่ใช้งาน
                    const formattedCategories = response.data.map(cat => ({
                        id: cat.name, // ใช้ name เป็น id
                        name: cat.name,
                        icon: cat.icon || '📋'
                    }));
                    setCategories(formattedCategories);
                } else {
                    // ไม่มีข้อมูล
                    setCategoriesError('ไม่พบข้อมูลหมวดหมู่ กรุณาติดต่อผู้ดูแลระบบ');
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategoriesError('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้ กรุณาลองใหม่อีกครั้ง');
                setCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const onSubmit = async (data) => {
        if (selectedCategories.length === 0) {
            setSubmitError('กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            setLoading(true);
            setSubmitError('');

            const userId = getCurrentUserId();

            console.log('📤 Submitting complaint...');
            console.log('👤 User ID:', userId);
            console.log('📹 Form Data:', {
                title: data.title,
                description: data.description?.substring(0, 50) + '...',
                building: data.building,
                floor: data.floor,
                room: data.room
            });
            console.log('📹 Selected Categories:', selectedCategories);
            console.log('📹 Files Count:', files.length);

            const formData = new FormData();

            formData.append('title', data.title);
            formData.append('description', data.description || '');

            const categoriesJSON = JSON.stringify(selectedCategories);
            formData.append('categories', categoriesJSON);
            console.log('✅ Categories JSON:', categoriesJSON);

            const locationData = {
                building: data.building,
                floor: data.floor,
                room: data.room || ''
            };
            const locationJSON = JSON.stringify(locationData);
            formData.append('location', locationJSON);
            console.log('✅ Location JSON:', locationJSON);

            formData.append('user_id', userId);
            console.log('✅ User ID appended:', userId);

            files.forEach((file, index) => {
                formData.append('images', file);
                console.log(`🔎 File ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB, ${file.type})`);
            });

            console.log('\n📋 FormData Summary:');
            let hasFiles = false;
            for (let pair of formData.entries()) {
                if (pair[1] instanceof File) {
                    console.log(`  ✅ ${pair[0]}: [File] ${pair[1].name}`);
                    hasFiles = true;
                } else {
                    console.log(`  ✅ ${pair[0]}: ${pair[1]}`);
                }
            }
            console.log(`  📊 Total Files: ${hasFiles ? files.length : 0}\n`);

            console.log('🌐 Calling API: POST /api/complaints');
            const response = await complaintAPI.create(formData);

            console.log('✅ API Response:', response);

            if (response.success) {
                alert('✅ สร้างเรื่องร้องเรียนสำเร็จ');
                const complaintId = response.data.complaint_id || response.data._id;
                console.log('📄 Navigating to:', `/complaint/${complaintId}`);
                navigate(`/complaint/${complaintId}`);
            } else {
                throw new Error(response.error || 'การสร้างเรื่องร้องเรียนไม่สำเร็จ');
            }
        } catch (error) {
            console.error('\n❌ ========== ERROR DETAILS ==========');
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);

            let errorMessage = 'เกิดข้อผิดพลาดในการส่งข้อมูล';

            if (error.response) {
                console.error('📡 Response Error:');
                console.error('  Status:', error.response.status);
                console.error('  Data:', error.response.data);
                console.error('  Headers:', error.response.headers);

                errorMessage = error.response.data?.error ||
                    error.response.data?.message ||
                    `Server Error ${error.response.status}`;

                if (error.response.data?.details) {
                    console.error('  Details:', error.response.data.details);
                }
            } else if (error.request) {
                console.error('📡 Request Error (No Response):');
                console.error('  Request:', error.request);
                errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
            } else {
                console.error('❌ Error:', error.message);
                errorMessage = error.message;
            }

            console.error('=====================================\n');

            setSubmitError(errorMessage);
            alert('❌ ' + errorMessage);
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
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent transition-all text-gray-600 ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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

                            {loadingCategories ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#55C388]"></div>
                                    <span className="ml-3 text-gray-600">กำลังโหลดหมวดหมู่...</span>
                                </div>
                            ) : categoriesError ? (
                                <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                                    <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                                    <p className="text-red-700 font-medium">{categoriesError}</p>
                                    <button
                                        type="button"
                                        onClick={() => window.location.reload()}
                                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        โหลดใหม่อีกครั้ง
                                    </button>
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                    <AlertCircle className="mx-auto text-yellow-600 mb-2" size={32} />
                                    <p className="text-yellow-800 font-medium">ไม่มีข้อมูลหมวดหมู่</p>
                                    <p className="text-sm text-yellow-700 mt-1">กรุณาติดต่อผู้ดูแลระบบ</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                    {categories.map(category => {
                                        const isSelected = selectedCategories.includes(category.id);

                                        return (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => handleCategoryToggle(category.id)}
                                                className={`relative flex flex-col items-center p-2.5 border rounded-lg transition-all hover:border-[#55C388] hover:shadow-sm ${isSelected
                                                    ? 'border-[#55C388] bg-green-50 shadow-sm'
                                                    : 'border-gray-200 bg-white'
                                                    }`}
                                            >
                                                {/* Checkmark Badge */}
                                                {isSelected && (
                                                    <div className="absolute -top-1.5 -right-1.5 bg-[#55C388] rounded-full p-0.5 shadow-sm">
                                                        <Check size={10} className="text-white" />
                                                    </div>
                                                )}

                                                {/* Icon */}
                                                <span className="text-2xl mb-1">{category.icon}</span>

                                                {/* Text */}
                                                <span className={`text-[10px] text-center font-medium leading-tight ${isSelected ? 'text-[#55C388]' : 'text-gray-700'
                                                    }`}>
                                                    {category.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

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
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent transition-all resize-y text-gray-600 ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
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