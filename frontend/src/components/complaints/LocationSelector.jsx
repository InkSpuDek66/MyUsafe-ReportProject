// frontend/src/components/complaints/LocationSelector.jsx
// Component สำหรับเลือกสถานที่ (อาคาร, ชั้น, ห้อง) - ใช้ข้อมูลจาก API จริง
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { locationAPI } from '../../services/locationAPI';

const LocationSelector = ({ register, errors, setValue }) => {
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('');
    const [loading, setLoading] = useState({
        buildings: false,
        floors: false,
        rooms: false
    });

    // ดึงข้อมูลอาคารทั้งหมดเมื่อ component โหลด
    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                setLoading(prev => ({ ...prev, buildings: true }));
                const response = await locationAPI.getBuildings();

                if (response.success && response.data) {
                    // แปลง array ของ string เป็น array ของ object
                    const buildingOptions = response.data.map(building => ({
                        id: building,
                        name: building
                    }));
                    setBuildings(buildingOptions);
                } else {
                    console.error('Failed to load buildings');
                }
            } catch (error) {
                console.error('Error fetching buildings:', error);
            } finally {
                setLoading(prev => ({ ...prev, buildings: false }));
            }
        };

        fetchBuildings();
    }, []);

    // ดึงข้อมูลชั้นเมื่อเลือกอาคาร
    const handleBuildingChange = async (e) => {
        const building = e.target.value;
        setSelectedBuilding(building);
        setSelectedFloor('');
        setFloors([]);
        setRooms([]);
        setValue('floor', '');
        setValue('room', '');

        if (!building) return;

        try {
            setLoading(prev => ({ ...prev, floors: true }));
            const response = await locationAPI.getFloorsByBuilding(building);

            if (response.success && response.data) {
                setFloors(response.data);
            }
        } catch (error) {
            console.error('Error fetching floors:', error);
        } finally {
            setLoading(prev => ({ ...prev, floors: false }));
        }
    };

    // ดึงข้อมูลห้องเมื่อเลือกชั้น
    const handleFloorChange = async (e) => {
        const floor = e.target.value;
        setSelectedFloor(floor);
        setRooms([]);
        setValue('room', '');

        if (!floor || !selectedBuilding) return;

        try {
            setLoading(prev => ({ ...prev, rooms: true }));
            const response = await locationAPI.getRoomsByBuildingFloor(selectedBuilding, floor);

            if (response.success && response.data) {
                setRooms(response.data);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(prev => ({ ...prev, rooms: false }));
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Building Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    อาคาร <span className="text-red-500">*</span>
                </label>
                <select
                    {...register('building', { required: 'กรุณาเลือกอาคาร' })}
                    onChange={(e) => {
                        handleBuildingChange(e);
                        register('building').onChange(e);
                    }}
                    disabled={loading.buildings}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent transition-all text-gray-500 ${errors.building ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        } ${loading.buildings ? 'cursor-wait opacity-50' : ''}`}
                >
                    <option value="">
                        {loading.buildings ? 'กำลังโหลด...' : 'เลือกอาคาร'}
                    </option>
                    {buildings.map(building => (
                        <option
                            key={building.id}
                            value={building.name}
                        >
                            {building.name}
                        </option>
                    ))}
                </select>
                {errors.building && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.building.message}
                    </p>
                )}
            </div>

            {/* Floor Selector */}
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
                    disabled={!selectedBuilding || loading.floors}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent transition-all text-gray-500 ${errors.floor ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        } ${(!selectedBuilding || loading.floors) ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    <option value="">
                        {loading.floors ? 'กำลังโหลด...' : 'เลือกชั้น'}
                    </option>
                    {floors.map(floor => (
                        <option key={floor} value={floor}>
                            {floor}
                        </option>
                    ))}
                </select>
                {errors.floor && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.floor.message}
                    </p>
                )}
                {!selectedBuilding && (
                    <p className="mt-1 text-xs text-gray-500">
                        💡 เลือกอาคารก่อนเพื่อเลือกชั้น
                    </p>
                )}
            </div>

            {/* Room Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    ห้อง <span className="text-gray-400 text-xs">(ถ้ามี)</span>
                </label>
                <select
                    {...register('room')}
                    disabled={!selectedFloor || loading.rooms}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55C388] focus:border-transparent transition-all text-gray-500 ${(!selectedFloor || loading.rooms) ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                >
                    <option value="">
                        {loading.rooms ? 'กำลังโหลด...' : 'เลือกห้อง (ถ้ามี)'}
                    </option>
                    {rooms.map(room => (
                        <option key={room} value={room}>
                            {room}
                        </option>
                    ))}
                </select>
                {!selectedFloor && (
                    <p className="mt-1 text-xs text-gray-500">
                        💡 เลือกชั้นก่อนเพื่อเลือกห้อง
                    </p>
                )}
            </div>
        </div>
    );
};

export default LocationSelector;