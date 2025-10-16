// frontend/src/components/common/LoadingSpinner.jsx
// Component สำหรับแสดง Loading Spinner
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'กำลังโหลด...' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-[#55C388]`} />
            {text && (
                <p className="mt-2 text-sm text-gray-600">{text}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;