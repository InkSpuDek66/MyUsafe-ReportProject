// backend/src/routes/locationRoutes.js
// Routes สำหรับจัดการตำแหน่งอาคาร ชั้น และห้อง
// ================================
// Location APIs Checklist
// 1. [GET] /api/locations/buildings - ดึงรายการอาคารทั้งหมด
// 2. [GET] /api/locations/floors/:building - ดึงรายการชั้นตามอาคาร
// 3. [GET] /api/locations/rooms/:building/:floor - ดึงรายการห้องตามอาคารและชั้น
// 4. [POST] /api/locations - เพิ่มตำแหน่งใหม่ (อาคาร, ชั้น, ห้อง)
// ================================
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/buildings', locationController.getBuildings);
router.get('/floors/:building', locationController.getFloorsByBuilding);
router.get('/rooms/:building/:floor', locationController.getRoomsByBuildingFloor);
router.post('/', locationController.createLocation);

module.exports = router;