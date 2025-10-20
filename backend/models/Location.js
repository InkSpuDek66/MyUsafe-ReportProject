import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  building: { type: String, required: true },
  floor: { type: String, required: true },
  room: { type: String },
  university_id: { type: mongoose.Schema.Types.ObjectId, ref: 'University' } // Phase 2
});

export default mongoose.model('Location', locationSchema);
