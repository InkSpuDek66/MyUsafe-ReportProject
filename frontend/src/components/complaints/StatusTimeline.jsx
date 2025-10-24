// frontend/src/components/complaints/StatusTimeline.jsx
// Component สำหรับแสดงประวัติการเปลี่ยนแปลงสถานะของเรื่องร้องเรียนในรูปแบบ Timeline
import { CheckCircle, Clock } from 'lucide-react';

const StatusTimeline = ({ history = [] }) => {
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                ยังไม่มีประวัติการเปลี่ยนแปลงสถานะ
            </div>
        );
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="relative border-l-4 border-[#55C388]/30 ml-3 py-2">
            {history.map((item, index) => (
                <div
                    key={index}
                    className="ml-6 mb-6 relative"
                >
                    {/* Timeline Dot */}
                    <div className="absolute -left-[26px] top-1.5">
                        <div className={`w-4 h-4 rounded-full ${
                            index === 0 
                                ? 'bg-[#55C388]' 
                                : 'bg-gray-300'
                        } border-2 border-white shadow`} />
                    </div>

                    {/* Content Card */}
                    <div className={`bg-gradient-to-br ${
                        index === 0 
                            ? 'from-green-50 to-blue-50 border-green-200' 
                            : 'from-gray-50 to-gray-100 border-gray-200'
                    } p-4 rounded-lg border shadow-sm`}>
                        {/* Status Name */}
                        <div className="flex items-center gap-2 mb-2">
                            {index === 0 ? (
                                <CheckCircle size={18} className="text-[#55C388]" />
                            ) : (
                                <Clock size={18} className="text-gray-500" />
                            )}
                            <h4 className="font-semibold text-gray-800">
                                {item.status_name || item.status || item.action}
                            </h4>
                        </div>

                        {/* Date */}
                        <p className="text-xs text-gray-600 mb-2">
                            {formatDate(item.updated_at || item.created_at)}
                        </p>

                        {/* Comment */}
                        {item.comment && (
                            <p className="text-sm text-gray-700 mt-2 pl-3 border-l-2 border-gray-300">
                                {item.comment}
                            </p>
                        )}

                        {/* Changed By */}
                        {item.changed_by && (
                            <p className="text-xs text-gray-500 mt-2">
                                โดย: {item.changed_by.name || 'ระบบ'}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatusTimeline;