// const multer = require('multer');
const path = require('path');

// กำหนดที่เก็บไฟล์
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // โฟลเดอร์เก็บไฟล์
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// backend/routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/homeController');

// Routes
router.get('/', complaintController.getComplaints);
router.get('/:id', complaintController.getComplaintById);
router.post('/', complaintController.createComplaint);
router.put('/:id', complaintController.updateComplaint);
router.delete('/:id', complaintController.deleteComplaint);

module.exports = router;
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

// router.post('/', upload.array('attachments'), complaintController.createComplaint);
