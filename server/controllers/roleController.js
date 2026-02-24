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
    const { name, type, description, icon, status, permissions, parentRole } = req.body;
    
    const defaultPerms = initializeDefaultPermissions();
    const finalPermissions = permissions || defaultPerms;
    
    console.log('Permissions to save:', JSON.stringify(finalPermissions, null, 2));
    
    // If parentRole is provided, add as child role to parent
    if (parentRole) {
      const parent = await Role.findById(parentRole);
      if (!parent) {
        return res.status(404).json({ message: 'Parent role not found' });
      }
      
      const childRole = {
        name,
        type,
        description,
        icon,
        status,
        permissions: finalPermissions
      };
      
      parent.childRoles.push(childRole);
      const savedParent = await parent.save();
      const addedChild = savedParent.childRoles[savedParent.childRoles.length - 1];
      
      return res.status(201).json(addedChild);
    }
    
    // Create parent role
    const role = new Role({
      name,
      type,
      description,
      icon,
      status,
      createdBy: req.user._id
    });
    
    role.permissions = finalPermissions;
    role.markModified('permissions');
    
    const savedRole = await role.save();
    console.log('Saved role permissions:', JSON.stringify(savedRole.permissions, null, 2));
    
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
    const { name, type, description, icon, status, permissions, parentRole, childRoleId } = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid role ID format' });
    }
    
    console.log('Updating role:', id);
    console.log('New permissions:', JSON.stringify(permissions, null, 2));
    
    // If updating a child role
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
      if (type) childRole.type = type;
      if (description) childRole.description = description;
      if (icon !== undefined) childRole.icon = icon;
      if (status !== undefined) childRole.status = status;
      if (permissions) childRole.permissions = permissions;
      
      await parent.save();
      return res.json(childRole);
    }
    
    // Update parent role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    if (name) role.name = name;
    if (type) role.type = type;
    if (description) role.description = description;
    if (icon !== undefined) role.icon = icon;
    if (status !== undefined) role.status = status;
    if (permissions) {
      role.permissions = permissions;
      role.markModified('permissions');
    }
    
    const savedRole = await role.save();
    console.log('Updated role permissions:', JSON.stringify(savedRole.permissions, null, 2));

    res.json(savedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentRole, childRoleId } = req.query;
    
    // If deleting a child role
    if (parentRole && childRoleId) {
      const parent = await Role.findById(parentRole);
      if (!parent) {
        return res.status(404).json({ message: 'Parent role not found' });
      }
      
      parent.childRoles.id(childRoleId).remove();
      await parent.save();
      
      return res.json({ message: 'Child role deleted successfully' });
    }
    
    // Delete parent role (and all its child roles)
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

module.exports = { createRole, getAllRoles, getRoleById, updateRole, deleteRole, getDefaultPermissions, getFirstLevelRoles, getUserPermissions };
