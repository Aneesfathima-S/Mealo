const express = require('express');
const router = express.Router();
const { saveProfile, getProfile } = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');

router.post('/profile', verifyToken, saveProfile);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
