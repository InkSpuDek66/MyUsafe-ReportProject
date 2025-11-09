// backend/src/controllers/locationController.js
// Controller สำหรับจัดการข้อมูลตำแหน่งอาคาร ชั้น และห้อง
const Location = require('../models/locationModel');

// GET: ดึงรายการอาคารทั้งหมด
exports.getBuildings = async (req, res) => {
    try {
        const buildings = await Location.distinct('building');

        res.json({
            success: true,
            data: buildings
        });
    } catch (err) {
        console.error('Get Buildings Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลอาคาร'
        });
    }
};

// GET: ดึงรายการชั้นของอาคาร
exports.getFloorsByBuilding = async (req, res) => {
    try {
        const { building } = req.params;

        const floors = await Location.distinct('floor', { building });

        res.json({
            success: true,
            data: floors
        });
    } catch (err) {
        console.error('Get Floors Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลชั้น'
        });
    }
};

// GET: ดึงรายการห้องของอาคารและชั้น
exports.getRoomsByBuildingFloor = async (req, res) => {
    try {
        const { building, floor } = req.params;

        const rooms = await Location.distinct('room', { building, floor });

        res.json({
            success: true,
            data: rooms.filter(room => room)
        });
    } catch (err) {
        console.error('Get Rooms Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลห้อง'
        });
    }
};

// GET: ดึงข้อมูล Location ทั้งหมด
exports.getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find().sort({ building: 1, floor: 1, room: 1 });

        res.json({
            success: true,
            data: locations
        });
    } catch (err) {
        console.error('Get All Locations Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        });
    }
};

// POST: เพิ่มตำแหน่งใหม่ (Admin only)
exports.createLocation = async (req, res) => {
    try {
        const { building, floor, room } = req.body;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!building || !floor || !room) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุอาคาร ชั้น และห้อง'
            });
        }

        // ตรวจสอบว่ามีสถานที่นี้อยู่แล้วหรือไม่
        const existingLocation = await Location.findOne({
            building: building.trim(),
            floor: floor.trim(),
            room: room.trim()
        });

        if (existingLocation) {
            return res.status(409).json({
                success: false,
                error: 'สถานที่นี้มีอยู่แล้ว',
                isDuplicate: true
            });
        }

        const newLocation = new Location({
            building: building.trim(),
            floor: floor.trim(),
            room: room.trim()
        });

        await newLocation.save();

        res.status(201).json({
            success: true,
            message: 'เพิ่มตำแหน่งสำเร็จ',
            data: newLocation
        });
    } catch (err) {
        console.error('Create Location Error:', err);
        
        // จัดการกรณี unique index violation
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                error: 'สถานที่นี้มีอยู่แล้ว',
                isDuplicate: true
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการเพิ่มตำแหน่ง'
        });
    }
};

// PUT: อัพเดทตำแหน่ง (Admin only)
exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { building, floor, room } = req.body;

        if (!building || !floor || !room) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุอาคาร ชั้น และห้อง'
            });
        }

        // ตรวจสอบว่ามีสถานที่อื่นที่มีข้อมูลซ้ำกันหรือไม่ (ยกเว้นตัวมันเอง)
        const existingLocation = await Location.findOne({
            _id: { $ne: id },
            building: building.trim(),
            floor: floor.trim(),
            room: room.trim()
        });

        if (existingLocation) {
            return res.status(409).json({
                success: false,
                error: 'สถานที่นี้มีอยู่แล้ว',
                isDuplicate: true
            });
        }

        const updatedLocation = await Location.findByIdAndUpdate(
            id,
            { 
                building: building.trim(), 
                floor: floor.trim(), 
                room: room.trim() 
            },
            { new: true, runValidators: true }
        );

        if (!updatedLocation) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบตำแหน่งที่ต้องการแก้ไข'
            });
        }

        res.json({
            success: true,
            message: 'แก้ไขตำแหน่งสำเร็จ',
            data: updatedLocation
        });
    } catch (err) {
        console.error('Update Location Error:', err);
        
        // จัดการกรณี unique index violation
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                error: 'สถานที่นี้มีอยู่แล้ว',
                isDuplicate: true
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการแก้ไขตำแหน่ง'
        });
    }
};

// DELETE: ลบตำแหน่ง (Admin only)
exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedLocation = await Location.findByIdAndDelete(id);

        if (!deletedLocation) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบตำแหน่งที่ต้องการลบ'
            });
        }

        res.json({
            success: true,
            message: 'ลบตำแหน่งสำเร็จ',
            data: deletedLocation
        });
    } catch (err) {
        console.error('Delete Location Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการลบตำแหน่ง'
        });
    }
};