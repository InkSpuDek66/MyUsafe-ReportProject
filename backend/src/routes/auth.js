const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); 
// ต้องเปลี่ยน path ให้ตรงกับที่ User.js ถูกเก็บไว้
const User = require('../models/userModel'); 
require('dotenv').config(); 

// ฟังก์ชันสร้าง JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// =================== 1. SIGN UP (สมัครสมาชิก) ===================
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // ตรวจสอบว่ามีอีเมลนี้อยู่แล้วหรือไม่ (ไม่จำเป็นต้องทำซ้ำ เพราะ User.js มี unique: true แล้ว แต่ทำเพิ่มเพื่อบอก error ที่ชัดเจนขึ้น)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ // 409 Conflict
        status: 'fail', 
        message: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น' 
      });
    }

    // สร้างผู้ใช้ใหม่ (รหัสผ่านจะถูก Hash โดย User.js pre('save') hook)
    const newUser = await User.create({
      name: `${firstName} ${lastName}`, 
      email,
      password,
      phone,
    });

    // สร้าง Token
    const token = signToken(newUser._id);

    // ไม่ส่ง password กลับไป
    newUser.password = undefined; 

    res.status(201).json({
      status: 'success',
      message: 'สมัครสมาชิกสำเร็จ',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    console.error('Sign Up Error:', error);
    // จัดการ Mongoose Validation Error
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({
            status: 'fail',
            message: `ข้อมูลไม่ถูกต้อง: ${messages.join(', ')}`
        });
    }
    res.status(500).json({ 
        status: 'error', 
        message: 'มีข้อผิดพลาดในการสมัครสมาชิก' 
    });
  }
});

// =================== 2. LOGIN (เข้าสู่ระบบ) ===================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. ตรวจสอบข้อมูลอินพุต
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'กรุณาระบุอีเมลและรหัสผ่าน' 
      });
    }

    // 2. ค้นหาผู้ใช้จากอีเมล (รวม password ที่ถูกซ่อนไว้มาเปรียบเทียบ)
    const user = await User.findOne({ email }).select('+password');

    // 3. ตรวจสอบผู้ใช้และรหัสผ่าน
    // user.comparePassword คือ method ที่เราสร้างไว้ใน User.js
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ // 401 Unauthorized
        status: 'fail', 
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' 
      });
    }

    // 4. สร้าง Token
    const token = signToken(user._id);
    
    // 5. ลบ password ออก
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
        status: 'error', 
        message: 'มีข้อผิดพลาดในการเข้าสู่ระบบ' 
    });
  }
});

module.exports = router;