// backend/src/models/locationModel.js
// Model สำหรับข้อมูลตำแหน่งอาคาร ชั้น และห้อง
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    building: {
        type: String,
        required: true,
        trim: true
    },
    floor: {
        type: String,
        required: true
    },
    room: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Index เพื่อค้นหาเร็วขึ้น
locationSchema.index({ building: 1, floor: 1 });

module.exports = mongoose.model('Location', locationSchema);