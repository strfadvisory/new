const roleManagementPermission = (req, res, next) => {
  try {
    const user = req.user;
    
    // Allow super admin
    if (user.isSuperAdmin) {
      return next();
    }
    
    // Check if user has role management permissions
    if (!user.rolePermissions) {
      return res.status(403).json({ message: 'Access denied. Role management permissions required.' });
    }
    
    // Check for specific role management permissions
    const hasCreateRole = user.rolePermissions['ROLE_MANAGEMENT.CREATE_ROLE'];
    const hasEditRole = user.rolePermissions['ROLE_MANAGEMENT.EDIT_ROLE'];
    const hasDeleteRole = user.rolePermissions['ROLE_MANAGEMENT.DELETE_ROLE'];
    
    if (!hasCreateRole && !hasEditRole && !hasDeleteRole) {
      return res.status(403).json({ message: 'Access denied. Role management permissions required.' });
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Access denied. Invalid permissions.' });
  }
};

module.exports = { roleManagementPermission };