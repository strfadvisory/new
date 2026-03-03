const User = require('../models/User');
const masterDataService = require('../services/masterDataService');

const restrictToUserRole = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.isSuperAdmin || req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const user = await User.findById(req.user._id).populate('roleId');
    if (!user || !user.roleId) {
      return res.status(403).json({ message: 'User role not found' });
    }

    req.userPermissions = user.roleId.permissions || [];
    next();
  } catch (error) {
    res.status(403).json({ message: 'Access denied: ' + error.message });
  }
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.userPermissions) {
        return res.status(403).json({ message: 'User permissions not initialized' });
      }

      if (!req.userPermissions.includes(permission)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(403).json({ message: 'Permission check failed: ' + error.message });
    }
  };
};

module.exports = {
  restrictToUserRole,
  requirePermission
};