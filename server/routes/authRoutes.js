const express = require('express');
const { register, login, verifyOTP, resendOTP, createCompanyProfile, inviteAdvisory, verifyAdvisoryToken, completeAdvisoryProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware.jsx');
const upload = require('../middleware/upload.jsx');
const { uploadToGridFS } = require('../middleware/upload.jsx');
const User = require('../models/User');
const mongoose = require('mongoose');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/company-profile', protect, upload.single('logo'), uploadToGridFS, createCompanyProfile);
router.post('/invite-advisory', protect, inviteAdvisory);
router.get('/verify-advisory/:token', verifyAdvisoryToken);
router.post('/complete-advisory-profile/:token', completeAdvisoryProfile);
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({ 'companyProfile.companyName': { $exists: true, $ne: null } })
      .populate('roleId', 'name')
      .select('-password -otp -otpExpiry');
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

router.delete('/user/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.companyProfile?.logoId) {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
      await bucket.delete(new mongoose.Types.ObjectId(user.companyProfile.logoId));
    }
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

router.delete('/remove-logo/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.companyProfile?.logoId) {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
      await bucket.delete(new mongoose.Types.ObjectId(user.companyProfile.logoId));
      user.companyProfile.logoId = undefined;
      await user.save();
    }
    res.json({ message: 'Logo removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing logo' });
  }
});

router.get('/file/:id', async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.id));
    downloadStream.pipe(res);
  } catch (error) {
    res.status(404).json({ message: 'File not found' });
  }
});

module.exports = router;