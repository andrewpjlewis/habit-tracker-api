const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,  // adds createdAt and updatedAt automatically
});

const HabitLog = mongoose.model('HabitLog', habitLogSchema);

module.exports = HabitLog;
