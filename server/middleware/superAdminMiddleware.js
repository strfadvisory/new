const User = require('../models/User');

const superAdminOnly = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { superAdminOnly };
