// frontend/src/components/complaints/PriorityBadge.jsx
// Component สำหรับแสดงระดับความสำคัญของเรื่องร้องเรียน
import { AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
    if (!priority) return null;

    const getPriorityConfig = (priority) => {
        const priorityMap = {
            'urgent': {
                label: 'ด่วนมาก',
                color: 'bg-red-100 text-red-800 border-red-300',
                icon: <Zap size={14} />
            },
            'high': {
                label: 'สูง',
                color: 'bg-orange-100 text-orange-800 border-orange-300',
                icon: <AlertTriangle size={14} />
            },
            'medium': {
                label: 'ปานกลาง',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                icon: <AlertCircle size={14} />
            },
            'low': {
                label: 'ต่ำ',
                color: 'bg-blue-100 text-blue-800 border-blue-300',
                icon: <Info size={14} />
            }
        };

        return priorityMap[priority.toLowerCase()] || {
            label: priority,
            color: 'bg-gray-100 text-gray-800 border-gray-300',
            icon: <Info size={14} />
        };
    };

    const config = getPriorityConfig(priority);

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            {config.icon}
            {config.label}
        </span>
    );
};

export default PriorityBadge;