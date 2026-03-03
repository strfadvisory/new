const Role = require('../models/Role');

// Middleware to validate role ownership for operations
const validateRoleOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Role ID is required' });
    }
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid role ID format' });
    }
    
    // Check if role exists and belongs to the authenticated user
    const role = await Role.findOne({ _id: id, createdBy: req.user._id });
    
    if (!role) {
      return res.status(404).json({ 
        message: 'Role not found or you do not have permission to access this role' 
      });
    }
    
    // Attach role to request for use in controller
    req.role = role;
    next();
    
  } catch (error) {
    console.error('Role ownership validation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to validate role type permissions for creation
const validateRoleTypePermission = (req, res, next) => {
  try {
    const { type } = req.body;
    
    // If user is not super admin and trying to create Master role
    if (!req.user.isSuperAdmin && type === 'Master') {
      return res.status(403).json({ 
        message: 'You do not have permission to create Master type roles. Only User type roles are allowed.' 
      });
    }
    
    next();
    
  } catch (error) {
    console.error('Role type permission validation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  validateRoleOwnership,
  validateRoleTypePermission
};