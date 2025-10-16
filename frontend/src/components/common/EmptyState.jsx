// frontend/src/components/common/EmptyState.jsx
// Component สำหรับแสดงสถานะเมื่อไม่มีข้อมูล
import { FileQuestion } from 'lucide-react';

const EmptyState = ({ 
    icon: Icon = FileQuestion,
    title = 'ไม่พบข้อมูล',
    description = 'ยังไม่มีข้อมูลในขณะนี้',
    action
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
                <Icon className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
                {description}
            </p>
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
};

export default EmptyState;