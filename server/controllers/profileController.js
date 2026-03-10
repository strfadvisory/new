const User = require('../models/User');

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

module.exports = { getProfile, changePassword, deleteAccount };
