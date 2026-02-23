const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const configService = require('../services/configService');
const { sendOTPEmail } = require('../services/emailService.jsx');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, designation, phone, password, address, companyType } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const role = await Role.findOne({ name: companyType,  status: true });
    if (!role) {
      return res.status(400).json({ message: 'Invalid company type' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      firstName,
      lastName,
      email,
      designation,
      phone,
      password,
      address,
      companyType: role.name,
      otp,
      otpExpiry,
      isVerified: false
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
    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id);
      
      if (user.isSuperAdmin) {
        const roleConfig = configService.getRoleConfig('SUPER_ADMIN');
        return res.json({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
          navigation: roleConfig?.navigation || [],
          permissions: roleConfig?.permissions || [],
          token
        });
      }
      
      const role = await Role.findOne({ name: user.companyType });
      
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyType: user.companyType,
        isSuperAdmin: false,
        navigation: [],
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

    if (user.otp !== otp) {
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
    
    if (req.file) {
      companyData.logoId = req.file.id;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.companyProfile = companyData;
    await user.save();

    const role = await Role.findOne({ name: user.companyType });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      companyType: user.companyType,
      navigation: [],
      permissions: role?.permissions || {},
      companyProfile: user.companyProfile
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { register, login, verifyOTP, resendOTP, createCompanyProfile };