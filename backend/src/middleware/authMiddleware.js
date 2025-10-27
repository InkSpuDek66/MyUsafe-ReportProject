// backend/src/middleware/authMiddleware.js
// Middleware สำหรับการตรวจสอบสิทธิ์ผู้ใช้ (Authentication & Authorization)
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Path ไปยัง User Model
require('dotenv').config();

// ----------------- 1. Protect Middleware (ตรวจสอบ Token) -----------------
exports.protect = async (req, res, next) => {
  let token;

  // 1. อ่าน Token จาก Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'คุณไม่ได้ล็อกอิน! กรุณาล็อกอินเพื่อเข้าถึง',
    });
  }

  try {
    // 2. ตรวจสอบความถูกต้องของ Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. ตรวจสอบว่าผู้ใช้ยังมีอยู่ในระบบ
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'ผู้ใช้ที่เป็นเจ้าของ Token นี้ไม่มีอยู่ในระบบแล้ว',
      });
    }

    // 4. เก็บข้อมูลผู้ใช้ไว้ใน req เพื่อใช้ใน Controller
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token ไม่ถูกต้อง',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token หมดอายุ',
      });
    }
    res.status(500).json({ status: 'error', message: 'ข้อผิดพลาดในการตรวจสอบสิทธิ์' });
  }
};

// ----------------- 2. Restrict To Middleware (ตรวจสอบ Role) -----------------
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user ถูกกำหนดโดย protect middleware
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ // 403 Forbidden
        status: 'fail',
        message: `คุณไม่มีสิทธิ์เข้าถึงการทำงานนี้ Role: ${req.user.role} ไม่สามารถดำเนินการได้`,
      });
    }
    next();
  };
};