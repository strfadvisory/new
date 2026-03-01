const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.id).select('-password');
      
      // Get user role permissions
      if (user && user.roleId) {
        const Role = require('../models/Role');
        let role = await Role.findById(user.roleId);
        
        // If role not found, search in childRoles
        if (!role) {
          const allRoles = await Role.find();
          for (const parentRole of allRoles) {
            if (parentRole.childRoles && parentRole.childRoles.length > 0) {
              const foundChild = parentRole.childRoles.find(child => child._id.toString() === user.roleId.toString());
              if (foundChild) {
                role = foundChild;
                break;
              }
              // Check in grandchild roles
              for (const childRole of parentRole.childRoles) {
                if (childRole.childRoles && childRole.childRoles.length > 0) {
                  const foundGrandChild = childRole.childRoles.find(grandChild => grandChild._id.toString() === user.roleId.toString());
                  if (foundGrandChild) {
                    role = foundGrandChild;
                    break;
                  }
                }
              }
              if (role) break;
            }
          }
        }
        
        if (role && role.permissions) {
          user.rolePermissions = role.permissions;
        }
      }
      
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
