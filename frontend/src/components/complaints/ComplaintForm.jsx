import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { XCircleIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const ComplaintForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();

    // Mock categories data
    const categories = [
        { id: 'flood', name: 'น้ำท่วม' },
        { id: 'electrical', name: 'ไฟฟ้า' },
        { id: 'computer', name: 'คอมพิวเตอร์/เว็บไซต์' },
        { id: 'other', name: 'อื่นๆ' }
    ];

    // Mock buildings data
    const buildings = [
        { id: '1', name: 'อาคาร 1' },
        { id: '2', name: 'อาคาร 2' },
        { id: '3', name: 'อาคาร 3' }
    ];

    // Mock data for rooms and floors
    const [floors] = useState([
        "ชั้น 1", "ชั้น 2", "ชั้น 3", "ชั้น 4", "ชั้น 5"
    ]);
    
    const [rooms] = useState({
        "ชั้น 1": ["101", "102", "103", "104"],
        "ชั้น 2": ["201", "202", "203", "204"],
        "ชั้น 3": ["301", "302", "303", "304"],
        "ชั้น 4": ["401", "402", "403", "404"],
        "ชั้น 5": ["501", "502", "503", "504"]
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const formData = new FormData();

            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('category', data.category);
            formData.append('location', JSON.stringify({
                building: data.building,
                floor: data.floor,
                room: data.room
            }));

            files.forEach(file => {
                formData.append('images', file);
            });

            const response = await axios.post('/api/complaints', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                alert('สร้างเรื่องร้องเรียนสำเร็จ');
                navigate(`/complaints/${response.data.data._id}`);
            }
        } catch (error) {
            console.error('Error submitting complaint:', error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        validateAndAddFiles(newFiles);
    };

    const validateAndAddFiles = (newFiles) => {
        if (newFiles.length + files.length > 5) {
            alert('สามารถอัปโหลดได้สูงสุด 5 ไฟล์');
            return;
        }

        const validFiles = newFiles.filter(file => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            const isValidType = isImage || isVideo;
            const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB

            if (!isValidType) {
                alert(`ไฟล์ ${file.name} ไม่รองรับ (อนุญาตเฉพาะรูปภาพหรือวิดีโอ)`);
                return false;
            }
            if (!isValidSize) {
                alert(`ไฟล์ ${file.name} มีขนาดเกิน 20MB (ขนาดปัจจุบัน: ${formatFileSize(file.size)})`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setFiles(prev => [...prev, ...validFiles]);

        const newPreviewUrls = validFiles.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name,
            size: file.size
        }));
        
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    };

    const removeFile = (index) => {
        URL.revokeObjectURL(previewUrls[index].url);
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleFloorChange = (e) => {
        const floor = e.target.value;
        setSelectedFloor(floor);
        setValue('room', '');
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        validateAndAddFiles(droppedFiles);
    }, [files]);

    const renderFileUpload = () => (
        <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors
                ${dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 bg-white'}`}
        >
            <div className="space-y-1 text-center">
                <div className="flex justify-center gap-2 mb-2">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                    <VideoCameraIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div className="flex justify-center text-sm text-gray-600">
                    <label htmlFor="files" className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                        <span>อัปโหลดไฟล์</span>
                        <input
                            id="files"
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="sr-only"
                        />
                    </label>
                    <p className="pl-1">หรือลากและวางที่นี่</p>
                </div>
                <p className="text-xs text-gray-500">
                    รองรับไฟล์ PNG, JPG, GIF, WebP, MP4, MOV, AVI, MKV, WebM
                </p>
                <p className="text-xs text-gray-500 font-semibold">
                    ขนาดไฟล์สูงสุด 20MB ต่อไฟล์ (สูงสุด 5 ไฟล์)
                </p>
            </div>
        </div>
    );

    const renderLocationFields = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    อาคาร <span className="text-red-500">*</span>
                </label>
                <select
                    {...register('building', { required: 'กรุณาเลือกอาคาร' })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.building ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                    <option value="">เลือกอาคาร</option>
                    {buildings.map(building => (
                        <option key={building.id} value={building.id}>
                            {building.name}
                        </option>
                    ))}
                </select>
                {errors.building && (
                    <p className="mt-1 text-sm text-red-500">{errors.building.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชั้น <span className="text-red-500">*</span>
                </label>
                <select
                    {...register('floor', { required: 'กรุณาเลือกชั้น' })}
                    onChange={(e) => {
                        handleFloorChange(e);
                        register('floor').onChange(e);
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.floor ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                    <option value="">เลือกชั้น</option>
                    {floors.map(floor => (
                        <option key={floor} value={floor}>
                            {floor}
                        </option>
                    ))}
                </select>
                {errors.floor && (
                    <p className="mt-1 text-sm text-red-500">{errors.floor.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    ห้อง
                </label>
                <select
                    {...register('room')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                    disabled={!selectedFloor}
                >
                    <option value="">เลือกห้อง</option>
                    {selectedFloor && rooms[selectedFloor]?.map(room => (
                        <option key={room} value={room}>
                            {room}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">แจ้งเรื่องร้องเรียน</h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                หัวข้อเรื่อง <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register('title', { 
                                    required: 'กรุณากรอกหัวข้อเรื่อง',
                                    minLength: { value: 5, message: 'หัวข้อต้องมีความยาวอย่างน้อย 5 ตัวอักษร' }
                                })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="ระบุหัวข้อเรื่องร้องเรียน"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Category Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                หมวดหมู่ <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('category', { required: 'กรุณาเลือกหมวดหมู่' })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.category ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">เลือกหมวดหมู่</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                            )}
                        </div>

                        {/* Location Fields */}
                        {renderLocationFields()}

                        {/* Description Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                รายละเอียด <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                {...register('description', { 
                                    required: 'กรุณากรอกรายละเอียด',
                                    minLength: { value: 10, message: 'รายละเอียดต้องมีความยาวอย่างน้อย 10 ตัวอักษร' }
                                })}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="อธิบายรายละเอียดของปัญหา"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                            )}
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ไฟล์แนบ (รูปภาพหรือวิดีโอ รวมสูงสุด 5 ไฟล์)
                            </label>
                            {renderFileUpload()}

                            {/* Preview */}
                            {previewUrls.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    <p className="text-sm text-gray-600">
                                        ไฟล์ที่เลือก ({files.length}/5)
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {previewUrls.map((preview, index) => (
                                            <div key={index} className="relative group border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                {preview.type === 'image' ? (
                                                    <img
                                                        src={preview.url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-40 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <video
                                                        src={preview.url}
                                                        controls
                                                        className="w-full h-40 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="mt-2 flex items-center justify-between">
                                                    <div className="text-xs text-gray-600 truncate flex-1">
                                                        <p className="font-medium truncate">{preview.name}</p>
                                                        <p className="text-gray-500">{formatFileSize(preview.size)}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                                        title="ลบไฟล์"
                                                    >
                                                        <XCircleIcon className="h-6 w-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        กำลังส่งข้อมูล...
                                    </span>
                                ) : 'ส่งเรื่องร้องเรียน'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ComplaintForm;