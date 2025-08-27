const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: String,
  category: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  fiber: Number,
  unit: String, // e.g., 100g, 1 cup, etc.
});

module.exports = mongoose.model('Food', foodSchema);