const express = require('express');
const { register, login, verifyOTP, resendOTP, createCompanyProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware.jsx');
const upload = require('../middleware/upload.jsx');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/company-profile', protect, upload.single('logo'), createCompanyProfile);

module.exports = router;