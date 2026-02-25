const express = require('express');
const { register, login, verifyOTP, resendOTP, createCompanyProfile, inviteAdvisory, verifyAdvisoryToken, completeAdvisoryProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware.jsx');
const upload = require('../middleware/upload.jsx');
const User = require('../models/User');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/company-profile', protect, upload.single('logo'), createCompanyProfile);
router.post('/invite-advisory', protect, inviteAdvisory);
router.get('/verify-advisory/:token', verifyAdvisoryToken);
router.post('/complete-advisory-profile/:token', completeAdvisoryProfile);
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({ 'companyProfile.companyName': { $exists: true, $ne: null } }).select('-password -otp -otpExpiry');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.get('/org-users', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const users = await User.find({ orgId: currentUser.orgId,   roleType: { $exists: true } }).select('-password -otp -otpExpiry');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;