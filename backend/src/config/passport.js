const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/userModel');

// ========================
// GOOGLE STRATEGY
// ========================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔍 Google Profile:', profile);

        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log('✅ User พบในระบบแล้ว:', user.email);
          return done(null, user);
        }

        console.log('🆕 สร้าง User ใหม่');
        
        const profileImage = profile.photos[0]?.value || null;
        
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: 'oauth-google-' + Math.random().toString(36).substr(2, 9),
          role: 'reporter',
          profile_image: profileImage,
          phone: '',
        });

        console.log('✅ User สร้างสำเร็จ:', user.email);
        console.log('📸 Profile Image:', profileImage);
        return done(null, user);
      } catch (error) {
        console.error('❌ Google Strategy Error:', error);
        return done(error, null);
      }
    }
  )
);

// ========================
// GITHUB STRATEGY
// ========================
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔍 GitHub Profile:', profile);

        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log('✅ User พบในระบบแล้ว:', user.email);
          return done(null, user);
        }

        console.log('🆕 สร้าง User ใหม่');
        
        const profileImage = profile.photos[0]?.value || null;
        
        user = await User.create({
          name: profile.displayName || profile.username,
          email: profile.emails[0].value,
          password: 'oauth-github-' + Math.random().toString(36).substr(2, 9),
          role: 'reporter',
          profile_image: profileImage,
          phone: '',
        });

        console.log('✅ User สร้างสำเร็จ:', user.email);
        console.log('📸 Profile Image:', profileImage);
        return done(null, user);
      } catch (error) {
        console.error('❌ GitHub Strategy Error:', error);
        return done(error, null);
      }
    }
  )
);

// ========================
// SERIALIZE & DESERIALIZE
// ========================
passport.serializeUser((user, done) => {
  console.log('📦 Serializing User:', user._id);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log('📦 Deserializing User:', user.email);
    done(null, user);
  } catch (error) {
    console.error('❌ Deserialize Error:', error);
    done(error, null);
  }
});

module.exports = passport;