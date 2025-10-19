// frontend/src/components/complaints/CommentSection.jsx
// Component สำหรับแสดงและจัดการความคิดเห็นของเรื่องร้องเรียน (Responsive Fixed)
import { useState, useEffect } from 'react';
import { Send, User, Edit2, Trash2 } from 'lucide-react';
import commentAPI from '../../services/commentAPI';

const CommentSection = ({ complaintId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const currentUser = {
        user_id: localStorage.getItem('user_id') || 'U0000001',
        user_name: localStorage.getItem('user_name') || 'Test User',
        user_role: localStorage.getItem('user_role') || 'reporter'
    };

    useEffect(() => {
        fetchComments();
    }, [complaintId]);

    const fetchComments = async () => {
        try {
            setFetchLoading(true);
            const response = await commentAPI.getByComplaint(complaintId);
            setComments(response.data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            alert('เกิดข้อผิดพลาดในการดึงความคิดเห็น');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setLoading(true);
            await commentAPI.add({
                complaint_id: complaintId,
                user_id: currentUser.user_id,
                user_name: currentUser.user_name,
                user_role: currentUser.user_role,
                comment: newComment
            });
            setNewComment('');
            await fetchComments();
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (commentId) => {
        if (!editText.trim()) return;

        try {
            await commentAPI.update(commentId, {
                user_id: currentUser.user_id,
                comment: editText
            });
            setEditingId(null);
            setEditText('');
            await fetchComments();
        } catch (error) {
            console.error('Error updating comment:', error);
            alert(error.response?.data?.error || 'เกิดข้อผิดพลาดในการแก้ไขความคิดเห็น');
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('ต้องการลบความคิดเห็นนี้หรือไม่?')) return;

        try {
            await commentAPI.delete(commentId, currentUser.user_id);
            await fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert(error.response?.data?.error || 'เกิดข้อผิดพลาดในการลบความคิดเห็น');
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

    const getRoleBadge = (role) => {
        const badges = {
            admin: { label: 'ผู้ดูแลระบบ', color: 'bg-red-100 text-red-800' },
            staff: { label: 'เจ้าหน้าที่', color: 'bg-blue-100 text-blue-800' },
            reporter: { label: 'ผู้แจ้ง', color: 'bg-green-100 text-green-800' }
        };
        return badges[role] || badges.reporter;
    };

    return (
        <div className="space-y-4 w-full max-w-full">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-3 sm:p-4 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    เพิ่มความคิดเห็น
                </label>
                <div className="flex flex-col gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="พิมพ์ความคิดเห็นของคุณ..."
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent resize-none text-sm"
                        disabled={loading}
                    />
                </div>
                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#55C388] text-white rounded-lg hover:bg-[#43A874] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                        <Send size={14} className="sm:size-4" />
                        <span className="hidden sm:inline">{loading ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}</span>
                        <span className="sm:hidden">{loading ? 'ส่ง...' : 'ส่ง'}</span>
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 w-full">
                {fetchLoading ? (
                    <p className="text-center text-gray-500 py-6 text-sm">กำลังโหลด...</p>
                ) : comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-6 text-sm">
                        ยังไม่มีความคิดเห็น
                    </p>
                ) : (
                    comments.map((comment) => {
                        const badge = getRoleBadge(comment.user_role);
                        const isOwner = comment.user_id === currentUser.user_id;
                        const isEditing = editingId === comment._id;

                        return (
                            <div
                                key={comment._id}
                                className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 w-full max-w-full"
                            >
                                {/* User Info */}
                                <div className="flex items-start gap-2 sm:gap-3 w-full">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#55C388]/10 flex items-center justify-center">
                                            <User size={16} className="sm:size-5 text-[#55C388]" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                                    {comment.user_name}
                                                </h4>
                                                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-gray-500 flex-shrink-0">
                                                    {formatDate(comment.created_at)}
                                                    {comment.is_edited && ' (แก้ไข)'}
                                                </span>
                                                {isOwner && !isEditing && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(comment._id);
                                                                setEditText(comment.comment);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 p-1"
                                                            title="แก้ไข"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(comment._id)}
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="ลบ"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Comment Content */}
                                        {isEditing ? (
                                            <div className="space-y-2 w-full">
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent resize-none text-sm"
                                                    rows={3}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(comment._id)}
                                                        className="px-3 py-1 bg-[#55C388] text-white rounded text-sm hover:bg-[#43A874]"
                                                    >
                                                        บันทึก
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            setEditText('');
                                                        }}
                                                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                                                    >
                                                        ยกเลิก
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                                                <p
                                                    className="text-gray-700 text-xs sm:text-sm"
                                                    style={{
                                                        wordBreak: 'break-all',
                                                        wordWrap: 'break-word',
                                                        overflowWrap: 'anywhere',
                                                        whiteSpace: 'pre-wrap',
                                                        maxWidth: '100%',
                                                        width: '100%',
                                                        display: 'block'
                                                    }}
                                                >
                                                    {comment.comment}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CommentSection;