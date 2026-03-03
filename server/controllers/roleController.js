const Role = require('../models/Role');
const User = require('../models/User');
const Library = require('../models/Library');
const masterDataService = require('../services/masterDataService');

const createRole = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    
    const type = req.user.role === 'SUPER_ADMIN' || req.user.isSuperAdmin ? 'Master' : 'User';
    
    const role = new Role({
      name,
      description,
      icon: icon || 'user',
      type,
      status: true,
      permissions: [],
      nextSteps: [],
      videos: [],
      createdBy: req.user._id
    });
    
    const savedRole = await role.save();
    res.status(201).json(savedRole);
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    
    // Ensure all roles have empty arrays if undefined
    const rolesWithDefaults = roles.map(role => ({
      ...role.toObject(),
      permissions: role.permissions || [],
      nextSteps: role.nextSteps || [],
      videos: role.videos || []
    }));
    
    res.json(rolesWithDefaults);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { name, description, icon, status, permissions, nextSteps, videos } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    
    if (name) role.name = name;
    if (description) role.description = description;
    if (icon) role.icon = icon;
    if (status !== undefined) role.status = status;
    if (permissions) role.permissions = permissions;
    if (nextSteps) role.nextSteps = nextSteps;
    if (videos) role.videos = videos;
    
    const savedRole = await role.save();
    res.json(savedRole);
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    
    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMasterRoles = async (req, res) => {
  try {
    const roles = await Role.find({ status: true, type: 'Master' })
      .select('name icon description');
    res.json(roles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserPermissions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isSuperAdmin) {
      return res.json({
        permissions: ['SUPER_ADMIN'],
        navigation: [{ level: 'Super Admin', path: '/dashboard/admin' }],
        menu: [{ level: 'Super Admin', path: '/dashboard/admin' }]
      });
    }

    const role = user.roleId;
    const navigation = masterDataService.getUserNavigation(role?.permissions || []);
    
    res.json({ 
      permissions: role?.permissions || [],
      navigation,
      menu: navigation
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserNextSteps = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const role = user.roleId;
    const nextSteps = role?.nextSteps?.map(id => masterDataService.getNextStepById(id)).filter(Boolean) || [];

    res.json({ nextSteps });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserVideos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const role = user.roleId;
    if (!role || !role.videos || role.videos.length === 0) {
      return res.json({ videos: [] });
    }

    // Fetch videos from Library collection using the IDs stored in role.videos
    const videos = await Library.find({ 
      _id: { $in: role.videos },
      isActive: true 
    });

    res.json({ videos });
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
  getUserVideos
};