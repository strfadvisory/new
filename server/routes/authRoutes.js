const express = require('express');
const { register, login, verifyOTP, resendOTP, createCompanyProfile, addMember, inviteAdvisory, verifyAdvisoryToken, completeAdvisoryProfile, forgotPassword, resetPassword, verifyResetToken, resendMemberInvitation, verifyMemberToken, completeMember } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware.jsx');
const { upload, uploadToGridFS } = require('../middleware/upload.jsx');
const User = require('../models/User');
const mongoose = require('mongoose');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password/:token', resetPassword);
router.post('/company-profile', protect, upload.single('logo'), uploadToGridFS, createCompanyProfile);
router.post('/addmember', protect, addMember);
router.post('/resend-member-invitation/:userId', protect, resendMemberInvitation);
router.get('/verify-member/:token', verifyMemberToken);
router.post('/complete-member/:token', completeMember);
router.post('/invite-advisory', protect, inviteAdvisory);
router.get('/verify-advisory/:token', verifyAdvisoryToken);
router.post('/complete-advisory-profile/:token', completeAdvisoryProfile);
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpiry');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin || false,
      companyType: user.companyType,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user info' });
  }
});

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpiry');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

router.get('/users', protect, async (req, res) => {
  try {
    let users;
    
    // If user is super admin, show all users
    if (req.user.isSuperAdmin) {
      users = await User.find({})
        .populate('roleId', 'name')
        .select('-password -otp -otpExpiry');
    }
    // If user is ADMIN role, show users they created
    else if (req.user.role === 'ADMIN') {
      users = await User.find({ createdBy: req.user._id })
        .populate('roleId', 'name')
        .select('-password -otp -otpExpiry');
    }
    // If user is USER role, show users in their organization
    else if (req.user.role === 'USER') {
      // Find users where current user is in their memberfor array, or users created by companies user is member of
      const currentUser = await User.findById(req.user._id);
      
      // Get companies user is member of
      const memberOfCompanies = currentUser.memberfor || [];
      
      // Find users created by those companies, plus users where current user is in memberfor
      users = await User.find({
        $or: [
          { createdBy: { $in: memberOfCompanies } },
          { memberfor: req.user._id },
          { _id: req.user._id } // Include current user
        ]
      })
      .populate('roleId', 'name')
      .select('-password -otp -otpExpiry');
    }
    else {
      // For other roles, show users they created
      users = await User.find({ createdBy: req.user._id })
        .populate('roleId', 'name')
        .select('-password -otp -otpExpiry');
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// New endpoint to get users with organization request status
router.get('/users-with-requests', protect, async (req, res) => {
  try {
    const loggedInUser = req.user;
    
    // Get users created by current user (existing members)
    const createdUsers = await User.find({ createdBy: loggedInUser._id })
      .populate('roleId', 'name')
      .select('-password -otp -otpExpiry');
    
    // Get users who have pending/accepted/rejected requests from current user
    const usersWithRequests = await User.find({
      'reqorg.orgId': loggedInUser._id
    })
    .populate('roleId', 'name')
    .select('-password -otp -otpExpiry');
    
    // Helper function to resolve role ID to role name
    const resolveRoleName = (roleId) => {
      if (!roleId || !roleId.includes('_')) {
        return roleId; // Return as-is if not an ID
      }
      
      // Load master data
      const fs = require('fs');
      const path = require('path');
      try {
        const masterPath = path.join(__dirname, '../master.json');
        const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
        
        // Search through all role categories
        for (const roleCategory of Object.keys(masterData.roles)) {
          const categoryRoles = masterData.roles[roleCategory].subRoles || [];
          const foundRole = categoryRoles.find(r => r.id === roleId);
          if (foundRole) {
            return foundRole.role;
          }
        }
      } catch (error) {
        console.error('Error loading master data:', error);
      }
      
      return roleId; // Return original if not found
    };
    
    // Combine and format the results
    const allUsers = [];
    
    // Add created users with 'member' status
    createdUsers.forEach(user => {
      allUsers.push({
        ...user.toObject(),
        requestStatus: user.status === 'pending' ? 'invitation_pending' : 'member',
        requestRole: resolveRoleName(user.designation) || 'Member'
      });
    });
    
    // Add users with organization requests
    usersWithRequests.forEach(user => {
      const request = user.reqorg.find(req => req.orgId.toString() === loggedInUser._id.toString());
      if (request) {
        // Check if user is already in createdUsers to avoid duplicates
        const existingIndex = allUsers.findIndex(u => u._id.toString() === user._id.toString());
        if (existingIndex === -1) {
          allUsers.push({
            ...user.toObject(),
            requestStatus: request.status, // pending, accepted, rejected
            requestRole: resolveRoleName(request.role)
          });
        } else {
          // Update existing user with request info
          allUsers[existingIndex].requestStatus = request.status;
          allUsers[existingIndex].requestRole = resolveRoleName(request.role);
        }
      }
    });
    
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users with requests:', error);
    res.status(500).json({ message: 'Error fetching users with requests' });
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
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid file ID format' });
    }
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    
    // Check if file exists
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const file = files[0];
    
    // Set appropriate headers
    res.set({
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Access-Control-Allow-Origin': '*'
    });
    
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
    
    downloadStream.on('error', (error) => {
      console.error('GridFS download error:', error);
      if (!res.headersSent) {
        res.status(404).json({ message: 'Error downloading file' });
      }
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    console.error('File endpoint error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router;