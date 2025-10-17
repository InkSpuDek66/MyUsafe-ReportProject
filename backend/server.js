// backend/server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const complaintRoutes = require('./src/routes/homeRoutes');
const Complaint = require('./src/models/homeModel');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const PORT = process.env.PORT || 5000;

// ================= MongoDB Connect ==================
mongoose
  .connect('mongodb://127.0.0.1:27017/MyUSafe_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('🟢 Connected to MongoDB'))
  .catch((err) => console.error('🔴 MongoDB connection error:', err));

// ================= Middleware ===================
app.use(cors());
app.use(express.json());

// ================= Routes ===================
app.use('/api/complaints', complaintRoutes);

// ================= Socket.IO ===================
const viewedMap = new Map();

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('view_complaint', async (complaintId) => {
    if (!complaintId) return;

    const key = `${socket.id}_${complaintId}`;
    if (viewedMap.has(key)) return;

    viewedMap.set(key, true);
    const c = await Complaint.findOne({ complaint_id: complaintId });
    if (!c) return;

    c.views = (c.views || 0) + 1;
    await c.save();

    io.emit('update_views', { id: complaintId, views: c.views });
  });

  socket.on('disconnect', () => {
    for (const key of viewedMap.keys()) {
      if (key.startsWith(socket.id)) viewedMap.delete(key);
    }
  });
});

// ================= Start Server ===================
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import User from './models/User.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ เชื่อม MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ route ทดสอบ insert user
app.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: 'User created', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ route ทดสอบ login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bcrypt = await import('bcryptjs');
    const isMatch = await bcrypt.default.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    res.json({ message: 'Login success', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
