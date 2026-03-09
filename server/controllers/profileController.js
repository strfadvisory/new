const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate('roleId', 'name')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profileData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.roleId?.name || user.role || 'User',
      createdAt: user.createdAt
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile };
