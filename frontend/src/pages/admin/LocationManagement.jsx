// frontend/src/pages/admin/LocationManagement.jsx
// Page สำหรับจัดการสถานที่ (อาคาร, ชั้น, ห้อง) โดยแอดมิน
import { useState, useEffect } from 'react';
import { Search, X, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LocationManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    building: '',
    floor: '',
    room: ''
  });

  useEffect(() => {
    fetchBuildings();
    fetchAllLocations();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await fetch(`${API_URL}/locations/buildings`);
      const data = await response.json();
      if (data.success) {
        setBuildings(data.data);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  // แก้ไข: ใช้ GET /api/locations เพื่อดึงข้อมูลทั้งหมดพร้อม _id
  const fetchAllLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/locations`);
      const data = await response.json();
      
      if (data.success) {
        setLocations(data.data);
        setFilteredLocations(data.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBuilding) {
      fetchFloors(selectedBuilding);
    } else {
      setFloors([]);
      setSelectedFloor('');
      setRooms([]);
      setSelectedRoom('');
    }
  }, [selectedBuilding]);

  const fetchFloors = async (building) => {
    try {
      const response = await fetch(`${API_URL}/locations/floors/${building}`);
      const data = await response.json();
      if (data.success) {
        setFloors(data.data);
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
    }
  };

  useEffect(() => {
    if (selectedBuilding && selectedFloor) {
      fetchRooms(selectedBuilding, selectedFloor);
    } else {
      setRooms([]);
      setSelectedRoom('');
    }
  }, [selectedFloor]);

  const fetchRooms = async (building, floor) => {
    try {
      const response = await fetch(`${API_URL}/locations/rooms/${building}/${floor}`);
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  useEffect(() => {
    let filtered = locations;
    
    if (selectedBuilding) {
      filtered = filtered.filter(loc => loc.building === selectedBuilding);
    }
    
    if (selectedFloor) {
      filtered = filtered.filter(loc => loc.floor === selectedFloor);
    }
    
    if (selectedRoom) {
      filtered = filtered.filter(loc => loc.room === selectedRoom);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(loc => 
        loc.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.floor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.room?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLocations(filtered);
    setCurrentPage(1);
    updateActiveFilters();
  }, [selectedBuilding, selectedFloor, selectedRoom, searchTerm, locations]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLocations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const updateActiveFilters = () => {
    const filters = [];
    if (selectedBuilding) filters.push({ type: 'building', value: selectedBuilding, label: `อาคาร: ${selectedBuilding}` });
    if (selectedFloor) filters.push({ type: 'floor', value: selectedFloor, label: selectedFloor });
    if (selectedRoom) filters.push({ type: 'room', value: selectedRoom, label: selectedRoom });
    setActiveFilters(filters);
  };

  const removeFilter = (type) => {
    if (type === 'building') {
      setSelectedBuilding('');
      setSelectedFloor('');
      setSelectedRoom('');
      setFloors([]);
      setRooms([]);
    } else if (type === 'floor') {
      setSelectedFloor('');
      setSelectedRoom('');
      setRooms([]);
    } else if (type === 'room') {
      setSelectedRoom('');
    }
  };

  const handleAdd = () => {
    setModalMode('create');
    setFormData({ building: '', floor: '', room: '' });
    setSelectedLocation(null);
    setShowModal(true);
  };

  const handleEdit = (location) => {
    setModalMode('edit');
    setSelectedLocation(location);
    setFormData({
      building: location.building,
      floor: location.floor,
      room: location.room || ''
    });
    setShowModal(true);
  };

  // แก้ไข: แยก logic ระหว่าง Create และ Update
  const handleSave = async () => {
    try {
      if (!formData.building || !formData.floor) {
        alert('กรุณากรอกอาคารและชั้น');
        return;
      }

      let response;
      
      if (modalMode === 'create') {
        // POST: สร้างใหม่
        response = await fetch(`${API_URL}/locations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // PUT: แก้ไข
        response = await fetch(`${API_URL}/locations/${selectedLocation._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();

      if (data.success) {
        alert(modalMode === 'create' ? 'เพิ่มตำแหน่งสำเร็จ' : 'แก้ไขตำแหน่งสำเร็จ');
        setShowModal(false);
        fetchBuildings();
        fetchAllLocations();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  // แก้ไข: เรียกใช้ DELETE API
  const handleDelete = async (location) => {
    if (!confirm(`คุณต้องการลบ ${location.building} - ${location.floor} - ${location.room || 'ไม่ระบุห้อง'} หรือไม่?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/locations/${location._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('ลบตำแหน่งสำเร็จ');
        fetchBuildings();
        fetchAllLocations();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#55C38E] to-[#45B37E] rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">จัดการสถานที่</h1>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-white text-[#55C38E] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Plus size={20} />
              เพิ่มสถานที่
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Filters */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหาสถานที่..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C38E]"
                />
              </div>

              {/* Building Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">อาคาร</label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C38E]"
                >
                  <option value="">ทั้งหมด</option>
                  {buildings.map((building) => (
                    <option key={building} value={building}>{building}</option>
                  ))}
                </select>
              </div>

              {/* Floor Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">ชั้น</label>
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  disabled={!selectedBuilding}
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C38E] disabled:bg-gray-100"
                >
                  <option value="">ทั้งหมด</option>
                  {floors.map((floor) => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
              </div>

              {/* Room Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">ห้อง</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  disabled={!selectedFloor}
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C38E] disabled:bg-gray-100"
                >
                  <option value="">ทั้งหมด</option>
                  {rooms.map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">ตัวกรองที่เลือก</h3>
                  <div className="space-y-2">
                    {activeFilters.map((filter, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#55C38E] text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <span>{filter.label}</span>
                        <button
                          onClick={() => removeFilter(filter.type)}
                          className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    (พบทั้งหมด: {filteredLocations.length} รายการ)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#55C38E] mx-auto"></div>
                  <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">อาคาร</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ชั้น</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ห้อง</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentItems.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                              ไม่พบข้อมูลสถานที่
                            </td>
                          </tr>
                        ) : (
                          currentItems.map((location) => (
                            <tr key={location._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-700">{location.building}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{location.floor}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{location.room || '-'}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEdit(location)}
                                    className="flex items-center gap-1 bg-[#55C38E] hover:bg-[#45B37E] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <Edit2 size={16} />
                                    แก้ไข
                                  </button>
                                  <button
                                    onClick={() => handleDelete(location)}
                                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <Trash2 size={16} />
                                    ลบ
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">แสดง</label>
                          <select
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            className="px-3 py-1.5 text-[#55C38E] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#55C38E]"
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          <label className="text-sm text-gray-600">รายการ</label>
                        </div>
                        <p className="text-sm text-gray-600">
                          แสดง {filteredLocations.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredLocations.length)} จาก {filteredLocations.length} รายการ
                        </p>
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center text-gray-600 gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft size={16} />
                            ก่อนหน้า
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                              page === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                                  ...
                                </span>
                              ) : (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    currentPage === page
                                      ? 'bg-[#55C38E] text-white'
                                      : 'border text-gray-600 border-gray-300 hover:bg-gray-100'
                                  }`}
                                >
                                  {page}
                                </button>
                              )
                            ))}
                          </div>
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center text-gray-600 gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            ถัดไป
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === 'create' ? 'เพิ่มสถานที่ใหม่' : 'แก้ไขสถานที่'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อาคาร <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  placeholder="เช่น อาคาร 1"
                  className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C38E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชั้น <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="เช่น ชั้น 3"
                  className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C38E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ห้อง (ไม่จำเป็น)
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="เช่น ห้อง 301"
                  className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#55C38E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#55C38E] hover:bg-[#45B37E] text-white rounded-lg font-medium transition-colors"
              >
                {modalMode === 'create' ? 'เพิ่ม' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;