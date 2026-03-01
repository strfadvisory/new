const Role = require('../models/Role');
const menuData = require('../menubar.json');

const initializeDefaultPermissions = () => {
  const permissions = {};
  menuData.modules.forEach(mod => {
    mod.permissions.forEach(perm => {
      permissions[`${mod.module}.${perm.code}`] = false;
    });
  });
  return permissions;
};

const cascadePermissionsToChildren = async (roleId) => {
  const parentRole = await Role.findById(roleId);
  if (!parentRole) return;
  
  const childRoles = await Role.find({ parentRoleId: roleId });
  
  for (const child of childRoles) {
    const newInherited = parentRole.effectivePermissions || parentRole.permissions || {};
    const updatedOwnPermissions = { ...child.ownPermissions };
    
    Object.keys(updatedOwnPermissions).forEach(key => {
      if (updatedOwnPermissions[key] === true && newInherited[key] !== true) {
        updatedOwnPermissions[key] = false;
      }
    });
    
    child.inheritedPermissions = newInherited;
    child.ownPermissions = updatedOwnPermissions;
    child.markModified('inheritedPermissions');
    child.markModified('ownPermissions');
    await child.save();
    
    await cascadePermissionsToChildren(child._id);
  }
};

const createRole = async (req, res) => {
  try {
    const { name, description, icon, status, permissions, parentRoleId, nextSteps, video, type, userType } = req.body;
    
    let level = 0;
    let hierarchyPath = [];
    let inheritedPermissions = {};
    
    if (parentRoleId) {
      const parentRole = await Role.findById(parentRoleId);
      if (!parentRole) return res.status(404).json({ message: 'Parent role not found' });
      
      level = parentRole.level + 1;
      hierarchyPath = [...parentRole.hierarchyPath, parentRole._id];
      inheritedPermissions = parentRole.effectivePermissions || parentRole.permissions || {};
      
      if (permissions && !req.user.isSuperAdmin) {
        for (const [key, value] of Object.entries(permissions)) {
          if (value === true && inheritedPermissions[key] !== true) {
            return res.status(400).json({ message: `Permission ${key} not available from parent role` });
          }
        }
      }
    }
    
    const defaultPerms = initializeDefaultPermissions();
    const finalPermissions = permissions || defaultPerms;
    
    const roleType = type || 'User-Created';
    
    const role = new Role({
      name,
      type: roleType,
      description,
      icon: icon || '',
      status: status !== undefined ? status : true,
      createdBy: req.user._id,
      userType: userType || null,
      ownPermissions: finalPermissions,
      inheritedPermissions,
      parentRoleId: parentRoleId || null,
      level,
      hierarchyPath,
      nextSteps: nextSteps || [
        { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members and modules.', icon: 'user', completed: false },
        { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members and modules.', icon: 'building', completed: false },
        { title: 'Upload Reserve Study Data', description: 'Set up a new organizational entity to manage members and modules.', icon: 'file', completed: false },
        { title: 'Schedule meeting with Expert', description: 'Set up a new organizational entity to manage members and modules.', icon: 'calendar', completed: false }
      ],
      video: video || []
    });
    
    const savedRole = await role.save();
    console.log('Saved role - ID:', savedRole._id, 'type:', savedRole.type, 'userType:', savedRole.userType);
    res.status(201).json(savedRole);
    
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(400).json({ message: error.message });
  }
};

const getDefaultPermissions = (req, res) => {
  try {
    if (req.user.isSuperAdmin) {
      const defaultPermissions = initializeDefaultPermissions();
      res.json(defaultPermissions);
    } else {
      const userPermissions = req.user.rolePermissions || {};
      const allowedPermissions = {};
      
      Object.keys(userPermissions).forEach(key => {
        allowedPermissions[key] = false;
      });
      
      res.json(allowedPermissions);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ createdBy: req.user._id })
      .populate({
        path: 'parentRoleId',
        select: 'name type',
        populate: {
          path: 'parentRoleId',
          select: 'name type'
        }
      })
      .sort({ level: 1, createdAt: -1 })
      .lean();
    
    console.log('Fetched roles:', roles.map(r => ({ name: r.name, type: r.type, level: r.level, parentRoleId: r.parentRoleId })));
    
    res.json(roles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid role ID format' });
    }
    
    const role = await Role.findById(id)
      .populate('parentRoleId', 'name type')
      .lean();
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    const childRoles = await Role.find({ parentRoleId: id }).lean();
    role.childRoles = childRoles;
    
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, status, permissions, nextSteps, video } = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid role ID format' });
    }
    
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    if (name !== undefined) role.name = name;
    if (description !== undefined) role.description = description;
    if (icon !== undefined) role.icon = icon;
    if (status !== undefined) role.status = status;
    
    if (permissions) {
      if (role.parentRoleId && !req.user.isSuperAdmin) {
        const parentRole = await Role.findById(role.parentRoleId);
        const parentPerms = parentRole.effectivePermissions || parentRole.permissions || {};
        
        for (const [key, value] of Object.entries(permissions)) {
          if (value === true && parentPerms[key] !== true) {
            return res.status(400).json({ message: `Permission ${key} not available from parent role` });
          }
        }
      }
      
      role.ownPermissions = permissions;
      role.markModified('ownPermissions');
      
      await cascadePermissionsToChildren(role._id);
    }
    
    if (nextSteps !== undefined) {
      role.nextSteps = Array.isArray(nextSteps) ? nextSteps : [];
      role.markModified('nextSteps');
    }
    
    if (video !== undefined) {
      role.video = Array.isArray(video) ? video : [];
      role.markModified('video');
    }
    
    const savedRole = await role.save();
    res.json(savedRole);
    
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    const childCount = await Role.countDocuments({ parentRoleId: id });
    if (childCount > 0) {
      return res.status(400).json({ message: 'Cannot delete role with child roles. Delete children first.' });
    }
    
    await Role.findByIdAndDelete(id);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFirstLevelRoles = async (req, res) => {
  try {
    const roles = await Role.find({ type: '1', status: true }).select('name description icon').lean();
    res.json(roles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserPermissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findById(user.roleId);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const navigation = [];
    const menu = [];
    
    if (role.permissions) {
      Object.keys(role.permissions).forEach(key => {
        if (role.permissions[key]) {
          navigation.push(key);
        }
      });
      
      const menuMapping = {
        'SIMULATOR_MANAGEMENT.TRANSFER_ASSOCIATION': { level: 'Simulator', path: '/dashboard/simulator' },
        'SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR': { level: 'Simulator', path: '/dashboard/simulator' },
        'INVITATION_ONBOARDING.INVITE_MEMBERS': { level: 'Invitations', path: '/dashboard/invitations' },
        'COMPANY_CONTROL.CREATE_COMPANY': { level: 'Companies', path: '/dashboard/companies' },
        'ASSOCIATION_CONTROL.CREATE_SINGLE_ASSOCIATION': { level: 'Associations', path: '/dashboard/associations' },
        'USER_ROLE_MANAGEMENT.ADD_MEMBER_ROLE': { level: 'Users', path: '/dashboard/users' },
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

    res.json({ navigation, permissions: role.permissions, menu });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserNextSteps = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findById(user.roleId);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const incompleteSteps = (role.nextSteps || []).filter(step => step.completed);
    res.json({ nextSteps: incompleteSteps });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserVideos = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findById(user.roleId);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ videos: role.video || [] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getChildRoles = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findById(user.roleId);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const childRoles = await Role.find({ parentRoleId: role._id }).lean();

    res.json({ childRoles: childRoles || [] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserOwnRole = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findById(user.roleId);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUserOwnRole = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');
    const { name, description, icon, status, permissions, nextSteps, video } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findById(user.roleId);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (name) role.name = name;
    if (description) role.description = description;
    if (icon !== undefined) role.icon = icon;
    if (status !== undefined) role.status = status;
    if (permissions) {
      role.permissions = permissions;
      role.markModified('permissions');
    }
    if (nextSteps) {
      role.nextSteps = nextSteps;
      role.markModified('nextSteps');
    }
    if (video !== undefined) {
      role.video = video;
      role.markModified('video');
    }

    await role.save();

    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const bulkUpdatePermissions = async (req, res) => {
  try {
    const { roleIds, permissions } = req.body;
    
    if (!Array.isArray(roleIds) || !permissions) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    const results = [];
    
    for (const roleId of roleIds) {
      try {
        const role = await Role.findById(roleId);
        if (role) {
          role.ownPermissions = permissions;
          role.markModified('ownPermissions');
          await role.save();
          await cascadePermissionsToChildren(roleId);
          results.push({ roleId, success: true, role });
        } else {
          results.push({ roleId, success: false, error: 'Role not found' });
        }
      } catch (error) {
        results.push({ roleId, success: false, error: error.message });
      }
    }
    
    res.json({ results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRoleHierarchy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id).populate('parentRoleId').populate('hierarchyPath');
    if (!role) return res.status(404).json({ message: 'Role not found' });
    
    const children = await Role.find({ parentRoleId: id });
    
    res.json({
      role,
      parent: role.parentRoleId,
      children,
      hierarchy: role.hierarchyPath
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUserNextStep = async (req, res) => {
  try {
    const userId = req.user._id;
    const { stepIndex, completed } = req.body;
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findById(user.roleId);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (!role.nextSteps || stepIndex >= role.nextSteps.length) {
      return res.status(400).json({ message: 'Invalid step index' });
    }

    role.nextSteps[stepIndex].completed = completed;
    role.markModified('nextSteps');
    await role.save();

    res.json({ success: true, nextSteps: role.nextSteps });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getType2Roles = async (req, res) => {
  try {
    const roles = await Role.find({ type: '2', status: true }).select('name description icon type').lean();
    res.json(roles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getType3Roles = async (req, res) => {
  try {
    const { parentId } = req.params;
    const roles = await Role.find({ type: '3', parentRoleId: parentId, status: true }).select('name description icon type').lean();
    res.json(roles);
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
  getDefaultPermissions, 
  getFirstLevelRoles, 
  getUserPermissions, 
  getUserNextSteps, 
  getUserVideos, 
  getChildRoles, 
  getUserOwnRole, 
  updateUserOwnRole, 
  bulkUpdatePermissions, 
  getRoleHierarchy, 
  updateUserNextStep,
  getType2Roles,
  getType3Roles
};
