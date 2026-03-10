const express = require('express');
const { getProfile, changePassword, deleteAccount } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware.jsx');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
