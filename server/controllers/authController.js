const User = require('../models/User');
const jwt = require('jsonwebtoken');
const configService = require('../services/configService');

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

    // Get role key from display name
    const roleKey = configService.getRoleByDisplayName(companyType);
    const roleConfig = configService.getRoleConfig(roleKey);
    
    if (!roleConfig) {
      return res.status(400).json({ message: 'Invalid company type' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      designation,
      phone,
      password,
      address,
      companyType: roleConfig.code
    });

    const token = generateToken(user._id);
    
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      companyType: user.companyType,
      role: roleKey,
      navigation: roleConfig.navigation,
      permissions: roleConfig.permissions,
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const roleKey = configService.getRoleByCode(user.companyType);
      const roleConfig = configService.getRoleConfig(roleKey);
      
      const token = generateToken(user._id);
      
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyType: user.companyType,
        role: roleKey,
        navigation: roleConfig?.navigation || [],
        permissions: roleConfig?.permissions || [],
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { register, login };