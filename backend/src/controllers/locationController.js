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
            data: rooms.filter(room => room) // กรองห้องว่างออก
        });
    } catch (err) {
        console.error('Get Rooms Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลห้อง'
        });
    }
};

// POST: เพิ่มตำแหน่งใหม่ (Admin only)
exports.createLocation = async (req, res) => {
    try {
        const { building, floor, room } = req.body;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!building || !floor) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุอาคารและชั้น'
            });
        }

        const newLocation = new Location({
            building,
            floor,
            room: room || ''
        });

        await newLocation.save();

        res.status(201).json({
            success: true,
            message: 'เพิ่มตำแหน่งสำเร็จ',
            data: newLocation
        });
    } catch (err) {
        console.error('Create Location Error:', err);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการเพิ่มตำแหน่ง'
        });
    }
};