const express = require('express');
const { getProfile, changePassword, deleteAccount, uploadProfileImage, getProfileImage } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware.jsx');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);
router.post('/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);
router.get('/profile-image/:id', getProfileImage);

module.exports = router;
