// backend/src/models/userModel.js
// Model สำหรับผู้ใช้ระบบ

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ===================================
// สร้าง Schema สำหรับผู้ใช้
// ===================================
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'กรุณาใส่ชื่อ-นามสกุล'], 
    trim: true 
  }, 
  email: { 
    type: String, 
    required: [true, 'กรุณาใส่อีเมล'], 
    unique: true,  // สร้าง unique index อัตโนมัติ
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
    select: false  // ไม่ส่ง password กลับไปใน query
  }, 
  role: {
    type: String,
    enum: ['admin', 'staff', 'reporter'],
    default: 'reporter'
  },
  phone: { 
    type: String, 
    trim: true 
  },
  university_id: { 
    type: String, 
    trim: true 
  },
  profile_image: { 
    type: String, 
    default: null 
  },
  is_active: { 
    type: Boolean, 
    default: true 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
});

// ===================================
// Middleware: Hash password และ update timestamp
// ===================================
userSchema.pre('save', async function (next) {
  // อัพเดท timestamp ถ้าไม่ใช่การสร้างใหม่
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  
  // Hash password ถ้ามีการเปลี่ยนแปลง
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10); 
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ===================================
// Method: เปรียบเทียบรหัสผ่าน
// ===================================
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password); 
};

// ===================================
// Export Model
// ===================================
module.exports = mongoose.models.User 
  ? mongoose.model('User') 
  : mongoose.model('User', userSchema);