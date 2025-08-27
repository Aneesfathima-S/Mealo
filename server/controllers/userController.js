const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Make sure this path is correct
const Profile = require('../models/Profile');

const calculateBMI = (weight, height) => +(weight / ((height / 100) ** 2)).toFixed(2);

const calculateTDEE = (bmi, activity) => {
  const factor = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
  };
  return +(bmi * factor[activity || 'sedentary'] * 100).toFixed(2);
};

// 🔐 Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login error' });
  }
};

// 📥 Save or Update Profile
exports.saveProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const bmi = calculateBMI(data.weight, data.height);
    const tdee = calculateTDEE(bmi, data.activityLevel);

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      {
        ...data,
        bmi,
        tdee,
        userId,
        profilePic: data.profilePic
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Profile saved', profile: updatedProfile });
  } catch (err) {
    console.error('Save profile error:', err);
    res.status(500).json({ message: 'Profile save error' });
  }
};

// 📤 Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};
