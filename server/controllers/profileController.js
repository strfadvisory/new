const User = require('../models/User');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate('roleId', 'name')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profileData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      designation: user.designation,
      phone: user.phone,
      address: user.address,
      companyProfile: user.companyProfile,
      role: user.roleId?.name || user.role || 'User',
      profileImageId: user.profileImageId,
      createdAt: user.createdAt
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: error.message });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'profileImages' });
    
    const uploadStream = bucket.openUploadStream(`profile_${userId}`, {
      metadata: { userId: userId }
    });

    uploadStream.end(file.buffer);

    uploadStream.on('finish', async () => {
      user.profileImageId = uploadStream.id;
      await user.save();
      res.json({ message: 'Profile image uploaded successfully', profileImageId: uploadStream.id });
    });

    uploadStream.on('error', (error) => {
      res.status(500).json({ message: 'Upload failed', error: error.message });
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: error.message });
  }
};

const getProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'profileImages' });
    
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
    
    downloadStream.on('error', () => {
      res.status(404).json({ message: 'Image not found' });
    });
    
    res.set('Content-Type', 'image/jpeg');
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, changePassword, deleteAccount, uploadProfileImage, getProfileImage };
