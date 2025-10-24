// frontend/src/components/complaints/ImageUploader.jsx
// Component สำหรับอัปโหลดรูปภาพและวิดีโอ
import { useState, useCallback } from 'react';
import { PhotoIcon, XCircleIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

const ImageUploader = ({ files, setFiles, maxFiles = 5, maxSize = 20 * 1024 * 1024 }) => {
    const [previewUrls, setPreviewUrls] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const validateAndAddFiles = (newFiles) => {
        if (newFiles.length + files.length > maxFiles) {
            alert(`สามารถอัปโหลดได้สูงสุด ${maxFiles} ไฟล์`);
            return;
        }

        const validFiles = newFiles.filter(file => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            const isValidType = isImage || isVideo;
            const isValidSize = file.size <= maxSize;

            if (!isValidType) {
                alert(`ไฟล์ ${file.name} ไม่รองรับ (อนุญาตเฉพาะรูปภาพหรือวิดีโอ)`);
                return false;
            }
            if (!isValidSize) {
                alert(`ไฟล์ ${file.name} มีขนาดเกิน ${formatFileSize(maxSize)}`);
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

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        validateAndAddFiles(newFiles);
    };

    const removeFile = (index) => {
        URL.revokeObjectURL(previewUrls[index].url);
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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

    return (
        <div>
            {/* Upload Area */}
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
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500">
                            <span>กดที่นี่เพื่ออัปโหลดไฟล์</span>
                            <input
                                id="file-upload"
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
                        รองรับไฟล์ PNG, JPG, GIF, WebP, MP4, MOV
                    </p>
                    <p className="text-xs text-gray-500 font-semibold">
                        ขนาดไฟล์สูงสุด {formatFileSize(maxSize)} ต่อไฟล์ (สูงสุด {maxFiles} ไฟล์)
                    </p>
                </div>
            </div>

            {/* Preview */}
            {previewUrls.length > 0 && (
                <div className="mt-4 space-y-3">
                    <p className="text-sm text-gray-600">
                        ไฟล์ที่เลือก ({files.length}/{maxFiles})
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
    );
};

export default ImageUploader;