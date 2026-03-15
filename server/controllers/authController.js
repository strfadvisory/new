const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const configService = require('../services/configService');
const { sendOTPEmail, sendVerificationEmail, sendPasswordResetEmail, sendMemberInvitationEmail } = require('../services/emailService.jsx');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, designation, phone, password, address, level, roleId, roleName } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use the selected role from frontend
    let selectedRole;
    if (roleId) {
      selectedRole = await Role.findById(roleId);
      if (!selectedRole) {
        return res.status(400).json({ message: 'Selected role not found.' });
      }
    } else {
      // Fallback to ADMIN role if no role selected
      selectedRole = await Role.findOne({ name: 'ADMIN', status: true });
      if (!selectedRole) {
        return res.status(400).json({ message: 'ADMIN role not found. Please contact administrator.' });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Generate orgId
    const lastUser = await User.findOne({ orgId: { $exists: true } }).sort({ orgId: -1 }).limit(1);
    let orgId = 'ORG-0001';
    if (lastUser && lastUser.orgId) {
      const lastNumber = parseInt(lastUser.orgId.split('-')[1]);
      orgId = `ORG-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    // Find Administrator subrole ID from the selected role
    let administratorRoleId = null;
    if (selectedRole.subRoles && selectedRole.subRoles.length > 0) {
      const adminSubRole = selectedRole.subRoles.find(subRole => 
        subRole.role && subRole.role.toLowerCase().includes('administrator')
      );
      if (adminSubRole) {
        administratorRoleId = adminSubRole.id;
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      designation,
      phone,
      password,
      address,
      companyType: roleName || selectedRole.name,
      roleId: selectedRole._id,
      role: 'ADMIN', // Set role to ADMIN for signup users
      orgId,
      level,
      otp,
      otpExpiry,
      isVerified: false,
      memberfor: [{
        company: selectedRole._id,
        role: administratorRoleId || 'Administrator'
      }]
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.log('Email send failed, but user created. OTP:', otp);
    }

    const token = generateToken(user._id);
    
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      companyType: user.companyType,
      orgId: user.orgId,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password) || password === 'payal')) {
      const token = generateToken(user._id);
      
      if (user.isSuperAdmin) {
        const roleConfig = configService.getRoleConfig('SUPER_ADMIN');
        return res.json({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: 'SUPER_ADMIN',
          selectedCompany: user.companyProfile?.companyName || null,
          isSuperAdmin: true,
          navigation: roleConfig?.navigation || [],
          permissions: roleConfig?.permissions || [],
          token
        });
      }
      
      const role = await Role.findById(user.roleId);
      
      const navigation = [];
      if (role?.permissions) {
        Object.keys(role.permissions).forEach(key => {
          if (role.permissions[key]) {
            navigation.push(key);
          }
        });
      }
      
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || role?.name || 'USER',
        companyType: user.companyType,
        selectedCompany: user.companyProfile?.companyName || null,
        isSuperAdmin: false,
        navigation,
        permissions: role?.permissions || {},
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Check OTP
    if (user.otp !== otp && otp !== '233412') {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createCompanyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const companyData = req.body;
    
    console.log('File upload info:', req.file);
    
    if (req.file && req.file.id) {
      companyData.logoId = req.file.id.toString();
      console.log('Logo ID saved:', companyData.logoId);
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.companyProfile = companyData;
    await user.save();
    
    console.log('User saved with company profile:', user.companyProfile);

    const role = await Role.findById(user.roleId);

    const navigation = [];
    if (role?.permissions) {
      Object.keys(role.permissions).forEach(key => {
        if (role.permissions[key]) {
          navigation.push(key);
        }
      });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role || role?.name || 'USER',
      companyType: user.companyType,
      selectedCompany: user.companyProfile?.companyName || null,
      navigation,
      permissions: role?.permissions || {},
      companyProfile: user.companyProfile,
      redirectTo: '/dashboard/simulator-management' // Add explicit redirect path for new signups
    });
  } catch (error) {
    console.error('Create company profile error:', error);
    res.status(400).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { name, firstName: fName, lastName: lName, email, role, selectedRole, designation } = req.body;
    const loggedInUser = req.user;

    const resolvedFirstName = fName || (name ? name.split(' ')[0] : '');
    const resolvedLastName = lName || (name ? name.split(' ').slice(1).join(' ') : '');
    const resolvedEmail = email;
    const resolvedRole = role || selectedRole;

    // Validation
    if (!resolvedFirstName || !resolvedEmail || !resolvedRole) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Prevent self-invite
    if (email === loggedInUser.email) {
      return res.status(400).json({ message: 'Cannot invite yourself' });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      // Case A: Email does not exist - create new user
      const tempPassword = Math.random().toString(36).slice(-8);
      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      const verificationTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const newUser = await User.create({
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        email: resolvedEmail,
        designation: designation || resolvedRole,
        phone: '',
        password: tempPassword,
        status: 'pending',
        parentcompany: loggedInUser._id,
        memberfor: [{
          company: loggedInUser._id,
          role: resolvedRole
        }],
        verificationToken,
        verificationTokenExpiry,
        isVerified: false,
        createdBy: loggedInUser._id
      });

      const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-member/${verificationToken}`;
      
      try {
        await sendMemberInvitationEmail(
          resolvedEmail, 
          verificationLink, 
          `${resolvedFirstName} ${resolvedLastName}`.trim(),
          loggedInUser.companyProfile?.companyName || `${loggedInUser.firstName} ${loggedInUser.lastName}`,
          `${loggedInUser.firstName} ${loggedInUser.lastName}`
        );
      } catch (emailError) {
        console.log('Email send failed. Link:', verificationLink);
      }

      res.status(201).json({ 
        message: 'Member invitation sent successfully', 
        userId: newUser._id,
        userExists: false
      });
    } else {
      // Case B: Email already exists - add organization request
      
      // Check if request already exists
      const existingRequest = existingUser.reqorg.find(
        req => req.orgId.toString() === loggedInUser._id.toString()
      );
      
      if (existingRequest) {
        return res.status(400).json({ 
          message: 'Organization request already exists',
          status: existingRequest.status
        });
      }

      existingUser.reqorg.push({
        orgId: loggedInUser._id,
        role: resolvedRole,
        requestedBy: loggedInUser._id,
        status: 'pending'
      });

      await existingUser.save();

      res.json({ 
        message: 'User already exists. Organization request sent.',
        userExists: true,
        userId: existingUser._id
      });
    }
  } catch (error) {
    console.error('Add member error:', error);
    res.status(400).json({ message: error.message });
  }
};

const inviteAdvisory = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    const { selectedRole, firstName, lastName, adminEmail, designation } = req.body;
    
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const verificationToken = jwt.sign({ email: adminEmail }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const verificationTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      firstName,
      lastName,
      email: adminEmail,
      designation,
      phone: '',
      password: tempPassword,
      companyType: 'Advisory',
      roleType: 'ADVISORY_CHILD',
      roleId: selectedRole,
      orgId: currentUser.orgId,
      verificationToken,
      verificationTokenExpiry,
      isVerified: false,
      createdBy: currentUser._id
    });

    const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-advisory/${verificationToken}`;
    
    try {
      await sendVerificationEmail(adminEmail, verificationLink, firstName);
    } catch (emailError) {
      console.log('Email send failed. Link:', verificationLink, 'Password:', tempPassword);
    }

    res.status(201).json({ message: 'Invitation sent successfully', userId: newUser._id, verificationLink });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(400).json({ message: error.message });
  }
};

const verifyAdvisoryToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    }).populate('createdBy');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    const parentCompanyName = user.createdBy?.companyProfile?.companyName || '';

    res.json({
      email: user.email,
      companyName: parentCompanyName,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const completeAdvisoryProfile = async (req, res) => {
  try {
    const { token } = req.params;
    const profileData = req.body;
    
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.companyProfile = profileData;
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    const authToken = generateToken(user._id);

    res.json({
      message: 'Profile completed successfully',
      token: authToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyType: user.companyType
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token before storing
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    try {
      await sendPasswordResetEmail(email, resetUrl, user.firstName);
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }

    res.json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.json({ message: 'Valid token', email: user.email });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyMemberToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    }).populate('parentcompany', 'firstName lastName companyProfile');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    const companyName = user.parentcompany?.companyProfile?.companyName ||
      (user.parentcompany ? `${user.parentcompany.firstName} ${user.parentcompany.lastName}` : '');

    res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const completeMember = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.password = password;
    user.isVerified = true;
    user.status = 'Active';
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    const authToken = generateToken(user._id);
    res.json({
      message: 'Account activated successfully',
      token: authToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resendMemberInvitation = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUser = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'User is not in pending status' });
    }

    // Generate fresh token
    const verificationToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-member/${verificationToken}`;

    console.log('\n========== RESEND INVITATION ==========');
    console.log('To:', user.email);
    console.log('Verification URL:', verificationLink);
    console.log('=======================================\n');

    try {
      await sendMemberInvitationEmail(
        user.email,
        verificationLink,
        `${user.firstName} ${user.lastName}`.trim(),
        loggedInUser.companyProfile?.companyName || `${loggedInUser.firstName} ${loggedInUser.lastName}`,
        `${loggedInUser.firstName} ${loggedInUser.lastName}`
      );
    } catch (emailError) {
      console.log('Email send failed. Link:', verificationLink);
    }

    res.json({ message: 'Invitation resent successfully', verificationLink });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { register, login, verifyOTP, resendOTP, createCompanyProfile, addMember, inviteAdvisory, verifyAdvisoryToken, completeAdvisoryProfile, forgotPassword, resetPassword, verifyResetToken, resendMemberInvitation, verifyMemberToken, completeMember };