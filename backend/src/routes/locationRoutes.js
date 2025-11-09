// backend/src/routes/locationRoutes.js
// Routes สำหรับจัดการตำแหน่งอาคาร ชั้น และห้อง
// ================================
// Location APIs Checklist
// 1. [GET] /api/locations/buildings - ดึงรายการอาคารทั้งหมด
// 2. [GET] /api/locations/floors/:building - ดึงรายการชั้นตามอาคาร
// 3. [GET] /api/locations/rooms/:building/:floor - ดึงรายการห้องตามอาคารและชั้น
// 4. [GET] /api/locations - ดึงข้อมูล Location ทั้งหมด (เพิ่มใหม่)
// 5. [POST] /api/locations - เพิ่มตำแหน่งใหม่
// 6. [PUT] /api/locations/:id - แก้ไขตำแหน่ง (เพิ่มใหม่)
// 7. [DELETE] /api/locations/:id - ลบตำแหน่ง (เพิ่มใหม่)
// ================================
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// GET Routes
router.get('/buildings', locationController.getBuildings);
router.get('/floors/:building', locationController.getFloorsByBuilding);
router.get('/rooms/:building/:floor', locationController.getRoomsByBuildingFloor);
router.get('/', locationController.getAllLocations); // เพิ่มใหม่

// POST Route
router.post('/', locationController.createLocation);

// PUT Route (เพิ่มใหม่)
router.put('/:id', locationController.updateLocation);

// DELETE Route (เพิ่มใหม่)
router.delete('/:id', locationController.deleteLocation);

module.exports = router;