const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  name: String,
  age: Number,
  gender: String,
  weight: Number,
  height: Number,
  activityLevel: String,
  goal: String,
  diet: String,
  allergies: String,
  snacksAllowed: Boolean,
  bmi: Number,
  tdee: Number,
  profilePic: String,

  // ✅ NEW: Add region field
  region: {
    type: String,
    enum: [
      'Tamil Nadu',
      'Kerala',
      'Rajasthan',
      'Punjab',
      'Gujarat',
      'Maharashtra',
      'West Bengal',
      'Other'
    ],
    default: 'Other'
  }
});

module.exports = mongoose.model('Profile', profileSchema);
