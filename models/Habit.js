const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plantType: { type: String, required: true },
  progress: { type: Number, default: 0 },
  frequency: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

habitSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Habit', habitSchema);