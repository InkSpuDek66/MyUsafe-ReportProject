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
        required: true,
        trim: true
    },
    room: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Index เพื่อค้นหาเร็วขึ้นและป้องกันข้อมูลซ้ำ
locationSchema.index({ building: 1, floor: 1, room: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);