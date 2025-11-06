const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// ========================
// GOOGLE LOGIN
// ========================

// Step 1: เมื่อผู้ใช้กด "Login with Google"
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Step 2: หลังจาก Google ตรวจสอบ จะ redirect กลับมาที่นี่
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('✅ Google Callback Success');
    console.log('👤 User:', req.user);

    // ✅ สร้าง JWT Token
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🎫 JWT Token Created:', token);

    // ✅ Redirect ไปหน้า Frontend พร้อม Token + role
    const redirectUrl = `http://localhost:5173/auth-success?token=${token}&userId=${req.user._id}&email=${req.user.email}&role=${req.user.role}`;
    console.log('🔄 Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  }
);

// ========================
// GITHUB LOGIN
// ========================

// Step 1: เมื่อผู้ใช้กด "Login with GitHub"
router.get(
  '/auth/github',
  passport.authenticate('github', {
    scope: ['user:email'],
  })
);

// Step 2: หลังจาก GitHub ตรวจสอบ จะ redirect กลับมาที่นี่
router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('✅ GitHub Callback Success');
    console.log('👤 User:', req.user);

    // ✅ สร้าง JWT Token
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🎫 JWT Token Created:', token);

    // ✅ Redirect ไปหน้า Frontend พร้อม Token + role
    const redirectUrl = `http://localhost:5173/auth-success?token=${token}&userId=${req.user._id}&email=${req.user.email}&role=${req.user.role}`;
    console.log('🔄 Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  }
);

module.exports = router;