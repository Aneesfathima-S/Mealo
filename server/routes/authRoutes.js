const express = require('express');
const router = express.Router();
const admin = require('../config/firebaseAdmin');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { signup, login } = require('../controllers/authController');

// Email/Password Routes
router.post('/signup', signup);
router.post('/login', login);

// Google OAuth Login Route
router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { email, name, picture, uid } = decoded;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, googleId: uid, password: 'google-oauth' });
      await user.save();
    }

    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token: authToken });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

module.exports = router;
