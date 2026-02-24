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

const createRole = async (req, res) => {
  try {
    const { name, description, icon, status, permissions, parentRole, childRoleId } = req.body;
    
    const defaultPerms = initializeDefaultPermissions();
    const finalPermissions = permissions || defaultPerms;
    
    // If adding grandchild (3rd level)
    if (parentRole && childRoleId) {
      const parent = await Role.findById(parentRole);
      if (!parent) {
        return res.status(404).json({ message: 'Parent role not found' });
      }
      
      const childRole = parent.childRoles.id(childRoleId);
      if (!childRole) {
        return res.status(404).json({ message: 'Child role not found' });
      }
      
      const activeParentPerms = {};
      Object.keys(childRole.permissions).forEach(key => {
        if (childRole.permissions[key] === true) {
          activeParentPerms[key] = false;
        }
      });
      
      const grandChildRole = {
        name,
        type: 'Members',
        description,
        icon,
        status,
        permissions: activeParentPerms
      };
      
      if (!childRole.childRoles) childRole.childRoles = [];
      childRole.childRoles.push(grandChildRole);
      await parent.save();
      
      return res.status(201).json(grandChildRole);
    }
    
    // If adding child (2nd level)
    if (parentRole) {
      const parent = await Role.findById(parentRole);
      if (!parent) {
        return res.status(404).json({ message: 'Parent role not found' });
      }
      
      const activeParentPerms = {};
      Object.keys(parent.permissions).forEach(key => {
        if (parent.permissions[key] === true) {
          activeParentPerms[key] = false;
        }
      });
      
      const childRole = {
        name,
        type: 'Secondary',
        description,
        icon,
        status,
        permissions: activeParentPerms,
        childRoles: []
      };
      
      parent.childRoles.push(childRole);
      const savedParent = await parent.save();
      const addedChild = savedParent.childRoles[savedParent.childRoles.length - 1];
      
      return res.status(201).json(addedChild);
    }
    
    // Create parent role (1st level)
    const role = new Role({
      name,
      type: 'Primary',
      description,
      icon,
      status,
      createdBy: req.user._id
    });
    
    role.permissions = finalPermissions;
    role.markModified('permissions');
    
    const savedRole = await role.save();
    
    res.status(201).json(savedRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(400).json({ message: error.message });
  }
};

const getDefaultPermissions = (req, res) => {
  try {
    const defaultPermissions = initializeDefaultPermissions();
    res.json(defaultPermissions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 }).lean();
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
    
    const role = await Role.findById(id).lean();
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, status, permissions, parentRole, childRoleId, grandChildRoleId, nextSteps } = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid role ID format' });
    }
    
    // If updating a grandchild role (3rd level)
    if (parentRole && childRoleId && grandChildRoleId) {
      const parent = await Role.findById(parentRole);
      if (!parent) {
        return res.status(404).json({ message: 'Parent role not found' });
      }
      
      const childRole = parent.childRoles.id(childRoleId);
      if (!childRole) {
        return res.status(404).json({ message: 'Child role not found' });
      }
      
      const grandChildRole = childRole.childRoles.id(grandChildRoleId);
      if (!grandChildRole) {
        return res.status(404).json({ message: 'Grandchild role not found' });
      }
      
      if (name) grandChildRole.name = name;
      if (description) grandChildRole.description = description;
      if (icon !== undefined) grandChildRole.icon = icon;
      if (status !== undefined) grandChildRole.status = status;
      if (permissions) grandChildRole.permissions = permissions;
      if (nextSteps) grandChildRole.nextSteps = nextSteps;
      
      await parent.save();
      return res.json(grandChildRole);
    }
    
    // If updating a child role (2nd level)
    if (parentRole && childRoleId) {
      const parent = await Role.findById(parentRole);
      if (!parent) {
        return res.status(404).json({ message: 'Parent role not found' });
      }
      
      const childRole = parent.childRoles.id(childRoleId);
      if (!childRole) {
        return res.status(404).json({ message: 'Child role not found' });
      }
      
      if (name) childRole.name = name;
      if (description) childRole.description = description;
      if (icon !== undefined) childRole.icon = icon;
      if (status !== undefined) childRole.status = status;
      if (permissions) childRole.permissions = permissions;
      if (nextSteps) childRole.nextSteps = nextSteps;
      
      await parent.save();
      return res.json(childRole);
    }
    
    // Update parent role (1st level)
    const role = await Role.findById(id);
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
    const { parentRole, childRoleId, grandChildRoleId } = req.query;
    
    // If deleting a grandchild role (3rd level)
    if (parentRole && childRoleId && grandChildRoleId) {
      const parent = await Role.findById(parentRole);
      if (!parent) {
        return res.status(404).json({ message: 'Parent role not found' });
      }
      
      const childRole = parent.childRoles.id(childRoleId);
      if (!childRole) {
        return res.status(404).json({ message: 'Child role not found' });
      }
      
      childRole.childRoles.id(grandChildRoleId).remove();
      await parent.save();
      
      return res.json({ message: 'Grandchild role deleted successfully' });
    }
    
    // If deleting a child role (2nd level)
    if (parentRole && childRoleId) {
      const parent = await Role.findById(parentRole);
      if (!parent) {
        return res.status(404).json({ message: 'Parent role not found' });
      }
      
      parent.childRoles.id(childRoleId).remove();
      await parent.save();
      
      return res.json({ message: 'Child role deleted successfully' });
    }
    
    // Delete parent role (1st level - and all its children)
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    await Role.findByIdAndDelete(id);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFirstLevelRoles = async (req, res) => {
  try {
    const roles = await Role.find({ type: 'Primary', status: true }).select('name description icon').lean();
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
    if (role.permissions) {
      Object.keys(role.permissions).forEach(key => {
        if (role.permissions[key]) {
          navigation.push(key);
        }
      });
    }

    res.json({ navigation, permissions: role.permissions });
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

    const completedNextSteps = (role.nextSteps || []).filter(step => step.completed === true);

    res.json({ nextSteps: completedNextSteps });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createRole, getAllRoles, getRoleById, updateRole, deleteRole, getDefaultPermissions, getFirstLevelRoles, getUserPermissions, getUserNextSteps };
