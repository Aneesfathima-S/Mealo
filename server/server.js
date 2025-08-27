require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
const mealRoutes = require('./routes/mealRoutes');
app.use('/api/meal', mealRoutes);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✅');
    app.listen(5000, () => console.log('Server running on port 5000 🚀'));
  })
  .catch(err => console.error('Mongo error ❌', err));
