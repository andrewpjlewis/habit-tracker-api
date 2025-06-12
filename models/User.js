const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },         // Can be null for OAuth users
  googleId: { type: String, unique: true, sparse: true },  // Add Google ID field
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.email = this.email.toLowerCase();
  next();
});

module.exports = mongoose.model('User', userSchema);