// frontend/src/components/complaints/LocationSelector.jsx
// Component สำหรับเลือกสถานที่ (อาคาร, ชั้น, ห้อง)
import { useState } from 'react';

const LocationSelector = ({ register, errors, setValue }) => {
    const [selectedFloor, setSelectedFloor] = useState('');

    // Mock data - ในอนาคตจะดึงจาก API
    const buildings = [
        { id: '1', name: 'อาคาร 1' },
        { id: '2', name: 'อาคาร 2' },
        { id: '3', name: 'อาคาร 3' },
        { id: '4', name: 'อาคาร 4' },
        { id: '5', name: 'อาคาร 5' },
        { id: '6', name: 'อาคาร 6' },
        { id: '7', name: 'อาคาร 7' },
        { id: '8', name: 'อาคาร 8' },
        { id: '9', name: 'อาคาร 9' },
        { id: '10', name: 'อาคาร 10' },
        { id: '11', name: 'อาคาร 11' },
        { id: '12', name: 'อาคาร 12' }
    ];

    const floors = [
        'ชั้น 1', 'ชั้น 2', 'ชั้น 3', 'ชั้น 4',
        'ชั้น 5', 'ชั้น 6', 'ชั้น 7', 'ชั้น 8',
        'ชั้น 9', 'ชั้น 10', 'ชั้น 11', 'ชั้น 12',
        'ชั้น 13', 'ชั้น 14', 'ชั้น 15', 'ชั้น 16'
    ];

    const rooms = {
        'ชั้น 1': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','ลิฟต์'],
        'ชั้น 2': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','201', '202', '203', '204', '205'],
        'ชั้น 3': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','301', '302', '303', '304', '305'],
        'ชั้น 4': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','401', '402', '403', '404', '405'],
        'ชั้น 5': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','501', '502', '503', '504', '505'],
        'ชั้น 6': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','601', '602', '603', '604', '605'],
        'ชั้น 7': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','701', '702', '703', '704', '705'],
        'ชั้น 8': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','801', '802', '803', '804', '805'],
        'ชั้น 9': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','901', '902', '903', '904', '905'],
        'ชั้น 10': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','1001', '1002', '1003', '1004', '1005'],
        'ชั้น 11': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','1101', '1102', '1103', '1104', '1105'],
        'ชั้น 12': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','1201', '1202', '1203', '1204', '1205'],
        'ชั้น 13': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','1301', '1302', '1303', '1304', '1305'],
        'ชั้น 14': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','1401', '1402', '1403', '1404', '1405'],
        'ชั้น 15': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','1501', '1502', '1503', '1504', '1505'],
        'ชั้น 16': ['โถงทางเดิน','ห้องประชุม','ห้องน้ำชาย','ห้องน้ำหญิง','1601', '1602', '1603', '1604', '1605']
    };

    const handleFloorChange = (e) => {
        const floor = e.target.value;
        setSelectedFloor(floor);
        setValue('room', ''); // Reset room when floor changes
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Building */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    อาคาร <span className="text-red-500">*</span>
                </label>
                <select
                    {...register('building', { required: 'กรุณาเลือกอาคาร' })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-400 ${
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

            {/* Floor */}
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-400 ${
                        errors.floor ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                    <option value="" >เลือกชั้น</option>
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

            {/* Room */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    ห้อง
                </label>
                <select
                    {...register('room')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 text-gray-400"
                    disabled={!selectedFloor}
                >
                    <option value="">เลือกห้อง (ถ้ามี)</option>
                    {selectedFloor && rooms[selectedFloor]?.map(room => (
                        <option key={room} value={room}>
                            {room}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LocationSelector;