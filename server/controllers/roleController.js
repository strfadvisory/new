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
    const { name, type, description, icon, status, permissions } = req.body;
    
    const defaultPerms = initializeDefaultPermissions();
    const finalPermissions = permissions || defaultPerms;
    
    console.log('Permissions to save:', JSON.stringify(finalPermissions, null, 2));
    
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
    const { name, type, description, icon, status, permissions } = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid role ID format' });
    }
    
    console.log('Updating role:', id);
    console.log('New permissions:', JSON.stringify(permissions, null, 2));
    
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
    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createRole, getAllRoles, getRoleById, updateRole, deleteRole, getDefaultPermissions };
