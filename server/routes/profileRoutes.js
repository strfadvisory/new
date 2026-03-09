const express = require('express');
const { getProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware.jsx');

const router = express.Router();

router.get('/profile', protect, getProfile);

module.exports = router;
