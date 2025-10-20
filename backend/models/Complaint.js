import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  reporter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: {
    type: [String],
    enum: ['น้ำท่วม', 'ไฟฟ้า', 'คอมพิวเตอร์/เว็บไซต์', 'อื่นๆ'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: [String], validate: [arr => arr.length <= 5, 'Maximum 5 images allowed'] },
  location: {
    building: { type: String, required: true },
    floor: { type: String, required: true },
    room: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  university_id: { type: mongoose.Schema.Types.ObjectId, ref: 'University' }, // Phase 2
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  resolved_at: { type: Date }
});

export default mongoose.model('Complaint', complaintSchema);
