import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'staff', 'reporter'],
    default: 'reporter'
  },
  phone: { type: String },
  university_id: { type: mongoose.Schema.Types.ObjectId, ref: 'University' }, // Phase 2
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ university_id: 1, email: 1 });

export default mongoose.model('User', userSchema);
