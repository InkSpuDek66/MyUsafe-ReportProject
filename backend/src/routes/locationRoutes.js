// backend/src/routes/locationRoutes.js
// Routes สำหรับจัดการตำแหน่งอาคาร ชั้น และห้อง
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/buildings', locationController.getBuildings);
router.get('/floors/:building', locationController.getFloorsByBuilding);
router.get('/rooms/:building/:floor', locationController.getRoomsByBuildingFloor);
router.post('/', locationController.createLocation);

module.exports = router;