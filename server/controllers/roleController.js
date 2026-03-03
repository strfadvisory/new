const Role = require('../models/Role');
const User = require('../models/User');
const configService = require('../services/configService');

// Create Role
const createRole = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    
    // Check user's role field to determine what type of roles they can create
    let type = 'User'; // default

    console.log('User role:', req.user.role);
    console.log('User isSuperAdmin:', req.user.isSuperAdmin);
    console.log('User roleId type:', req.user.roleId?.type);
    
    // Only SUPER_ADMIN role or isSuperAdmin flag can create Master roles
    if (req.user.role === 'SUPER_ADMIN' || req.user.isSuperAdmin === true) {
      type = 'Master';
    }
    
    const role = new Role({
      name,
      description,
      icon: icon || 'user',
      type,
      status: true,
      createdBy: req.user._id,
      permissions: {},
      nextSteps: [],
      video: []
    });
    
    const savedRole = await role.save();
    res.status(201).json(savedRole);
    
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get All Roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(roles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Role by ID
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Role
const updateRole = async (req, res) => {
  try {
    const { name, description, icon, status, permissions, nextSteps, video, type } = req.body;
    
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    if (name) role.name = name;
    if (description) role.description = description;
    if (icon) role.icon = icon;
    if (status !== undefined) role.status = status;
    if (type) role.type = type;
    if (permissions) role.permissions = permissions;
    if (nextSteps) role.nextSteps = nextSteps;
    if (video) role.video = video;
    
    const savedRole = await role.save();
    res.json(savedRole);
    
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete Role
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Master Roles (for signup)
const getMasterRoles = async (req, res) => {
  try {
    const roles = await Role.find({ status: true, type: 'Master' })
      .select('name icon description');
    res.json(roles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get User Permissions
const getUserPermissions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isSuperAdmin) {
      const roleConfig = configService.getRoleConfig('SUPER_ADMIN');
      return res.json({
        navigation: roleConfig?.navigation || [],
        permissions: roleConfig?.permissions || [],
        menu: roleConfig?.menu || []
      });
    }

    const role = user.roleId;
    const navigation = [];
    const menu = [];
    
    if (role?.permissions) {
      Object.keys(role.permissions).forEach(key => {
        if (role.permissions[key]) {
          navigation.push(key);
        }
      });
      
      // Basic menu mapping
      const menuMapping = {
        'SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR': { level: 'Simulator', path: '/dashboard/simulator' },
        'INVITATION_ONBOARDING.INVITE_MEMBERS': { level: 'Invitations', path: '/dashboard/invitations' },
        'COMPANY_CONTROL.CREATE_COMPANY': { level: 'Companies', path: '/dashboard/companies' },
        'ASSOCIATION_CONTROL.CREATE_SINGLE_ASSOCIATION': { level: 'Associations', path: '/dashboard/associations' },
        'USER_MANAGEMENT.MANAGE_USERS': { level: 'User Management', path: '/dashboard/user-management' },
        'ROLE_MANAGEMENT.EDIT_ROLE': { level: 'Role Manager', path: '/dashboard/role-manager' },
        'BANKING_SERVICES.MANAGE_CD_PLANS': { level: 'Banking', path: '/dashboard/banking' }
      };
      
      const addedPaths = new Set();
      navigation.forEach(perm => {
        if (menuMapping[perm] && !addedPaths.has(menuMapping[perm].path)) {
          menu.push(menuMapping[perm]);
          addedPaths.add(menuMapping[perm].path);
        }
      });
    }

    res.json({ 
      navigation, 
      permissions: role?.permissions || {}, 
      menu 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get User Next Steps
const getUserNextSteps = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = user.roleId;
    const nextSteps = role?.nextSteps || [];

    res.json({ nextSteps });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get User Videos
const getUserVideos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = user.roleId;
    const videos = role?.video || [];

    res.json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update User Next Step
const updateUserNextStep = async (req, res) => {
  try {
    const { stepIndex, completed } = req.body;
    const user = await User.findById(req.user._id).populate('roleId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findById(user.roleId._id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (stepIndex >= 0 && stepIndex < role.nextSteps.length) {
      role.nextSteps[stepIndex].completed = completed;
      await role.save();
      res.json({ message: 'Next step updated successfully' });
    } else {
      res.status(400).json({ message: 'Invalid step index' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update User's Own Role
const updateUserOwnRole = async (req, res) => {
  try {
    const { name, description, icon, status, permissions, nextSteps, video } = req.body;
    const user = await User.findById(req.user._id).populate('roleId');
    
    if (!user || !user.roleId) {
      return res.status(404).json({ message: 'User role not found' });
    }

    const role = await Role.findById(user.roleId._id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    if (name) role.name = name;
    if (description) role.description = description;
    if (icon) role.icon = icon;
    if (status !== undefined) role.status = status;
    if (permissions) role.permissions = permissions;
    if (nextSteps) role.nextSteps = nextSteps;
    if (video) role.video = video;
    
    const savedRole = await role.save();
    res.json(savedRole);
    
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(400).json({ message: error.message });
  }
};

// Simple Role Update
const simpleUpdateRole = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    
    if (!_id) {
      return res.status(400).json({ message: 'Role ID is required' });
    }

    const role = await Role.findByIdAndUpdate(_id, updateData, { new: true });
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { 
  createRole, 
  getAllRoles, 
  getRoleById, 
  updateRole, 
  deleteRole,
  getMasterRoles,
  getUserPermissions,
  getUserNextSteps,
  getUserVideos,
  updateUserNextStep,
  updateUserOwnRole,
  simpleUpdateRole
};