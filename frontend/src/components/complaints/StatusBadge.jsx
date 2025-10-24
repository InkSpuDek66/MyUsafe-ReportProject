// frontend/src/components/complaints/StatusBadge.jsx
// Component สำหรับแสดงสถานะของเรื่องร้องเรียน
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        const statusMap = {
            'pending': {
                label: 'รอรับเรื่อง',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <Clock size={14} />
            },
            'รอรับเรื่อง': {
                label: 'รอรับเรื่อง',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <Clock size={14} />
            },
            'in_progress': {
                label: 'กำลังดำเนินการ',
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <AlertCircle size={14} />
            },
            'กำลังดำเนินการ': {
                label: 'กำลังดำเนินการ',
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <AlertCircle size={14} />
            },
            'ดำเนินการ': {
                label: 'กำลังดำเนินการ',
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <AlertCircle size={14} />
            },
            'resolved': {
                label: 'เสร็จสิ้น',
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: <CheckCircle size={14} />
            },
            'เสร็จสิ้น': {
                label: 'เสร็จสิ้น',
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: <CheckCircle size={14} />
            },
            'cancelled': {
                label: 'ยกเลิก',
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: <XCircle size={14} />
            },
            'ยกเลิก': {
                label: 'ยกเลิก',
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: <XCircle size={14} />
            }
        };

        return statusMap[status] || {
            label: status || 'ไม่ระบุ',
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: <AlertCircle size={14} />
        };
    };

    const config = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
            {config.icon}
            {config.label}
        </span>
    );
};

export default StatusBadge;