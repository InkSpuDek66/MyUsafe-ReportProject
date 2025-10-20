import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  auto_assign_dept: { type: String } // Phase 2
});

export default mongoose.model('Category', categorySchema);
