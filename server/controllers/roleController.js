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
    if (permissions) {
      // Handle both old format (array of strings) and new format (array of objects)
      role.permissions = permissions.map(perm => {
        if (typeof perm === 'string') {
          return { permissionId: perm, canEdit: true, limit: '' };
        }
        return {
          permissionId: perm.permissionId || perm.id,
          canEdit: perm.canEdit !== undefined ? perm.canEdit : true,
          limit: perm.limit || ''
        };
      });
    }
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

    // Handle users with roleId (new structure)
    if (user.roleId) {
      const role = user.roleId;
      const permissions = role?.permissions || [];
      
      // Pass the full permissions array to getUserNavigation
      const navigation = masterDataService.getUserNavigation(permissions);
      
      return res.json({ 
        permissions: permissions,
        navigation,
        menu: navigation
      });
    }

    // Handle users with legacy role field (USER, ADMIN, etc.)
    if (user.role === 'ADMIN') {
      // ADMIN users get all modules
      const allModules = masterDataService.masterData.modules.map(module => ({
        level: module.displayName,
        path: `/dashboard/${module.key.toLowerCase().replace('_', '-')}`
      }));
      
      return res.json({
        permissions: ['ADMIN'],
        navigation: allModules,
        menu: allModules
      });
    }

    // USER role gets default navigation (same as ADMIN for now)
    if (user.role === 'USER') {
      const defaultModules = masterDataService.masterData.modules.map(module => ({
        level: module.displayName,
        path: `/dashboard/${module.key.toLowerCase().replace('_', '-')}`
      }));
      
      return res.json({
        permissions: ['USER'],
        navigation: defaultModules,
        menu: defaultModules
      });
    }

    // Fallback for any other role
    return res.json({
      permissions: [],
      navigation: [],
      menu: []
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

const getUserSubRoles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('User found:', user.email);
    console.log('User isSuperAdmin:', user.isSuperAdmin);
    console.log('User roleId:', user.roleId);
    
    const role = user.roleId;
    if (!role) {
      console.log('No role found for user');
      return res.json({ 
        subRoles: [], 
        debug: { 
          message: 'No role assigned to user',
          suggestion: 'User needs to be assigned a role with subRoles'
        } 
      });
    }

    console.log('Role found:', role.name);
    console.log('Role subRoles:', role.subRoles);
    
    if (!role.subRoles || role.subRoles.length === 0) {
      console.log('No subRoles found in role');
      return res.json({ 
        subRoles: [], 
        debug: { 
          message: 'No subRoles found in user role', 
          roleName: role.name,
          roleType: role.type,
          suggestion: 'Contact administrator to configure subRoles for this role'
        } 
      });
    }

    // Get subRoles from the user's specific role and resolve role names
    const subRoles = role.subRoles.map(subRole => {
      // Try to resolve the role name from master data
      let roleName = subRole.role;
      
      // If the role field contains an ID, try to resolve it
      if (subRole.role && subRole.role.includes('_')) {
        // Load master data to resolve role names
        const masterData = masterDataService.masterData;
        if (masterData && masterData.roles) {
          // Search through all role categories
          Object.keys(masterData.roles).forEach(roleCategory => {
            const categoryRoles = masterData.roles[roleCategory].subRoles || [];
            const foundRole = categoryRoles.find(r => r.id === subRole.role);
            if (foundRole) {
              roleName = foundRole.role;
            }
          });
        }
      }
      
      return {
        _id: subRole.id,
        name: roleName,
        permissionLevel: subRole.permissionLevel
      };
    });

    console.log('Mapped subRoles with resolved names:', subRoles);

    res.json({ 
      subRoles,
      debug: {
        message: 'SubRoles found from user specific role',
        roleName: role.name,
        roleType: role.type,
        subRolesCount: subRoles.length
      }
    });
  } catch (error) {
    console.error('Error in getUserSubRoles:', error);
    res.status(400).json({ message: error.message, debug: { error: error.toString() } });
  }
};

const getRoleSubRoles = async (req, res) => {
  try {
    const { id: roleId } = req.params;
    
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const subRoles = role.subRoles?.map(subRole => ({
      _id: subRole.id,
      name: subRole.role,
      permissionLevel: subRole.permissionLevel
    })) || [];

    res.json({ 
      subRoles,
      roleName: role.name,
      roleType: role.type
    });
  } catch (error) {
    console.error('Error in getRoleSubRoles:', error);
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
  getUserSubRoles,
  getRoleSubRoles
};