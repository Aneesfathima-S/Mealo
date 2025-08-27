// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String }, // optional for Google login
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String } // optional
});

// Hash password only if it's not a Google OAuth placeholder
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.password === 'google-oauth') return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
