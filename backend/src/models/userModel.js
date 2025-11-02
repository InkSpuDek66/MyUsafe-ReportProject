// backend/src/models/userModel.js
// Model สำหรับผู้ใช้ระบบ
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'กรุณาใส่ชื่อ-นามสกุล'], trim: true }, 
  email: { 
    type: String, 
    required: [true, 'กรุณาใส่อีเมล'], 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'กรุณาใส่อีเมลที่ถูกต้อง'
    ]
  },
  password: { 
    type: String, 
    required: [true, 'กรุณาใส่รหัสผ่าน'],
    minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'],
    select: false
  }, 
  role: {
    type: String,
    enum: ['admin', 'staff', 'reporter'],
    default: 'reporter'
  },
  phone: { type: String, trim: true },
  university_id: { type: String, trim: true }, // ✅ เปลี่ยนเป็น String สำหรับรหัสนักศึกษา
  profile_image: { type: String, default: null }, // ✅ เพิ่ม field สำหรับรูปโปรไฟล์
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Middleware - รวม 2 อัน ไว้ใน 1 ตัว
userSchema.pre('save', async function (next) {
  // Update timestamp ก่อน hash password
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  
  // แล้วจึง hash password ถ้าเปลี่ยน
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10); 
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password); 
};

// Indexes
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.models.User 
  ? mongoose.model('User') 
  : mongoose.model('User', userSchema);