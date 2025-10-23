// backend/src/models/categoryModel.js
// Model สำหรับหมวดหมู่เรื่องร้องเรียน
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Category', categorySchema);