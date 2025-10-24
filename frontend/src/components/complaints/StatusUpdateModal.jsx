// frontend/src/components/complaints/StatusUpdateModal.jsx
// Modal สำหรับอัปเดตสถานะเรื่องร้องเรียน
import { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const StatusUpdateModal = ({ isOpen, onClose, complaint, onUpdate }) => {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [comment, setComment] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // กำหนด Status ที่สามารถเปลี่ยนได้
    const statusTransitions = {
        'รอรับเรื่อง': [
            { value: 'กำลังดำเนินการ', label: 'กำลังดำเนินการ', color: 'bg-blue-600' },
            { value: 'ยกเลิก', label: 'ยกเลิก', color: 'bg-red-600' }
        ],
        'กำลังดำเนินการ': [
            { value: 'เสร็จสิ้น', label: 'เสร็จสิ้น', color: 'bg-green-600' },
            { value: 'ยกเลิก', label: 'ยกเลิก', color: 'bg-red-600' }
        ],
        'เสร็จสิ้น': [],
        'ยกเลิก': []
    };

    const availableStatuses = statusTransitions[complaint?.current_status || 'รอรับเรื่อง'] || [];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStatus) {
            setError('กรุณาเลือกสถานะ');
            return;
        }

        if (!comment.trim()) {
            setError('กรุณาระบุความคิดเห็น');
            return;
        }

        if (selectedStatus === 'เสร็จสิ้น' && !resolutionNotes.trim()) {
            setError('กรุณาระบุรายละเอียดการแก้ไข');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await onUpdate(complaint.complaint_id, {
                status: selectedStatus,
                comment,
                resolution_notes: resolutionNotes
            });

            // Reset form
            setSelectedStatus('');
            setComment('');
            setResolutionNotes('');
            onClose();
        } catch (err) {
            console.error('Update status error:', err);
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        อัปเดตสถานะเรื่องร้องเรียน
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Current Status */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">สถานะปัจจุบัน:</p>
                        <p className="font-medium text-gray-900">{complaint?.current_status}</p>
                    </div>

                    {/* Select New Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            เปลี่ยนเป็นสถานะ <span className="text-red-500">*</span>
                        </label>
                        {availableStatuses.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                                ไม่สามารถเปลี่ยนสถานะได้อีก
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {availableStatuses.map((status) => (
                                    <button
                                        key={status.value}
                                        type="button"
                                        onClick={() => setSelectedStatus(status.value)}
                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${selectedStatus === status.value
                                                ? `${status.color} border-transparent text-white`
                                                : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                            }`}
                                    >
                                        <CheckCircle size={20} />
                                        <span className="font-medium">{status.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ความคิดเห็น <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="ระบุรายละเอียดการเปลี่ยนแปลงสถานะ..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent resize-none"
                            disabled={loading}
                        />
                    </div>

                    {/* Resolution Notes (เฉพาะเมื่อเลือก "เสร็จสิ้น") */}
                    {selectedStatus === 'เสร็จสิ้น' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                รายละเอียดการแก้ไข <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="ระบุวิธีการแก้ไขและผลลัพธ์..."
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent resize-none"
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                💡 ข้อมูลนี้จะแสดงให้ผู้แจ้งทราบ
                            </p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedStatus || availableStatuses.length === 0}
                        className="flex-1 px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusUpdateModal;