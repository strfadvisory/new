const User = require('../models/User');

const validateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ valid: false, message: 'Email is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ valid: false, message: 'Invalid email format' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ valid: false, message: 'Email already exists' });
    }

    res.json({ valid: true, message: 'Email is available' });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Server error' });
  }
};

module.exports = { validateEmail };