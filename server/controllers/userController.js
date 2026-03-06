const User = require('../models/User');
const Role = require('../models/Role');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('roleId', 'name type')
      .select('-password')
      .sort({ createdAt: -1 });
    
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      company: user.companyProfile?.companyName || user.companyType || 'N/A',
      role: user.roleId?.name || user.role || 'No Role',
      status: user.status || 'Active',
      createdAt: user.createdAt
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .populate('roleId', 'name type')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, roleId, status, companyProfile } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (roleId) updateData.roleId = roleId;
    if (status) updateData.status = status;
    if (companyProfile) updateData.companyProfile = companyProfile;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('roleId', 'name type').select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    if (!adminRole) {
      return res.status(404).json({ message: 'Admin role not found' });
    }

    const adminUsers = await User.find({ roleId: adminRole._id })
      .populate('roleId', 'name type')
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Return the full user objects instead of formatted ones
    res.json(adminUsers);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCompanies = async (req, res) => {
  try {
    // Find users with role 'ADMIN' or roleId pointing to ADMIN role
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    
    let companies = [];
    
    if (adminRole) {
      // Get users by roleId (new structure)
      const usersByRoleId = await User.find({ roleId: adminRole._id })
        .populate('roleId', 'name type permissions')
        .populate('createdBy', 'firstName lastName email')
        .select('-password')
        .sort({ createdAt: -1 });
      
      companies = [...companies, ...usersByRoleId];
    }
    
    // Also get users with role field set to 'ADMIN' (legacy structure)
    const usersByRoleField = await User.find({ role: 'ADMIN' })
      .populate('roleId', 'name type permissions')
      .populate('createdBy', 'firstName lastName email')
      .select('-password')
      .sort({ createdAt: -1 });
    
    companies = [...companies, ...usersByRoleField];
    
    // Remove duplicates based on _id
    const uniqueCompanies = companies.filter((company, index, self) => 
      index === self.findIndex(c => c._id.toString() === company._id.toString())
    );
    
    res.json(uniqueCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: error.message });
  }
};

const createCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create default company profile if it doesn't exist
    if (!user.companyProfile || !user.companyProfile.companyName) {
      const defaultCompanyProfile = {
        companyName: `${user.firstName} ${user.lastName} Company`,
        description: 'Default company profile',
        contactPerson: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || '',
        zipCode: user.address?.zipCode || '',
        state: user.address?.state || '',
        city: user.address?.city || '',
        address1: user.address?.address1 || '',
        address2: user.address?.address2 || ''
      };

      user.companyProfile = defaultCompanyProfile;
      await user.save();
    }

    res.json({ 
      message: 'Company profile created successfully', 
      companyProfile: user.companyProfile 
    });
  } catch (error) {
    console.error('Error creating company profile:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getUserById,
  updateUser,
  getAdminUsers,
  getCompanies,
  createCompanyProfile
};