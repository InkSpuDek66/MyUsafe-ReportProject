// frontend/src/components/complaints/CommentSection.jsx
// Component สำหรับแสดงและเพิ่มความคิดเห็นในเรื่องร้องเรียน
import { useState } from 'react';
import { Send, User } from 'lucide-react';

const CommentSection = ({ complaintId, comments = [], onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setLoading(true);
            await onAddComment(complaintId, newComment);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('th-TH', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    เพิ่มความคิดเห็น
                </label>
                <div className="flex gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="พิมพ์ความคิดเห็นของคุณ..."
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent resize-none"
                        disabled={loading}
                    />
                </div>
                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} />
                        {loading ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
                {comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">
                        ยังไม่มีความคิดเห็น
                    </p>
                ) : (
                    comments.map((comment, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                        >
                            {/* User Info */}
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-[#55C388]/10 flex items-center justify-center">
                                        <User size={20} className="text-[#55C388]" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-medium text-gray-900">
                                            {comment.user_id?.name || comment.user_name || 'ผู้ใช้'}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(comment.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm">
                                        {comment.comment || comment.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;