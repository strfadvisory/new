const Role = require('../models/Role');
const menuData = require('../menubar.json');
const PermissionInheritanceService = require('../services/permissionInheritanceService');

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
    
    if (req.user.isSuperAdmin) {
      const defaultPerms = initializeDefaultPermissions();
      const finalPermissions = permissions || defaultPerms;
      
      // If adding grandchild (3rd level)
      if (parentRole && childRoleId) {
        const parent = await Role.findById(parentRole);
        if (!parent) return res.status(404).json({ message: 'Parent role not found' });
        
        const childRole = parent.childRoles.id(childRoleId);
        if (!childRole) return res.status(404).json({ message: 'Child role not found' });
        
        // Only allow permissions that parent has
        const allowedPerms = {};
        Object.keys(childRole.permissions).forEach(key => {
          allowedPerms[key] = childRole.permissions[key] === true ? false : false;
        });
        
        const grandChildRole = {
          name,
          type: 'Members',
          description,
          icon,
          status,
          permissions: allowedPerms
        };
        
        if (!childRole.childRoles) childRole.childRoles = [];
        childRole.childRoles.push(grandChildRole);
        await parent.save();
        
        return res.status(201).json(grandChildRole);
      }
      
      // If adding child (2nd level)
      if (parentRole) {
        const parent = await Role.findById(parentRole);
        if (!parent) return res.status(404).json({ message: 'Parent role not found' });
        
        // Only allow permissions that parent has
        const allowedPerms = {};
        Object.keys(parent.effectivePermissions || parent.permissions || {}).forEach(key => {
          allowedPerms[key] = (parent.effectivePermissions || parent.permissions)[key] === true ? false : false;
        });
        
        const childRole = {
          name,
          type: 'Secondary',
          description,
          icon,
          status,
          permissions: allowedPerms,
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
        createdBy: req.user._id,
        ownPermissions: finalPermissions,
        level: 0
      });
      
      const savedRole = await role.save();
      return res.status(201).json(savedRole);
    }
    
    // Regular users create independent roles
    const userPermissions = req.user.rolePermissions || {};
    const allowedPermissions = {};
    
    if (permissions) {
      Object.keys(permissions).forEach(key => {
        allowedPermissions[key] = userPermissions[key] === true && permissions[key] === true;
      });
    }
    
    const role = new Role({
      name,
      type: 'User-Created',
      description,
      icon: icon || '',
      status: status !== undefined ? status : true,
      createdBy: req.user._id,
      ownPermissions: allowedPermissions,
      level: 0
    });
    
    const savedRole = await role.save();
    res.status(201).json(savedRole);
    
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(400).json({ message: error.message });
  }
};

const getDefaultPermissions = (req, res) => {
  try {
    if (req.user.isSuperAdmin) {
      // Super admin gets all permissions
      const defaultPermissions = initializeDefaultPermissions();
      res.json(defaultPermissions);
    } else {
      // Regular users get subset of their own permissions
      const userPermissions = req.user.rolePermissions || {};
      const allowedPermissions = {};
      
      Object.keys(userPermissions).forEach(key => {
        allowedPermissions[key] = false; // Default to false, user can enable
      });
      
      res.json(allowedPermissions);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    let roles;
    
    // Only show roles created by the current user, regardless of admin status
    roles = await Role.find({ 
      createdBy: req.user._id
    }).sort({ createdAt: -1 }).lean();
    
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
    const { name, description, icon, status, permissions, parentRole, childRoleId, grandChildRoleId, nextSteps, video } = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid role ID format' });
    }
    
    console.log('Updating role:', { id, parentRole, childRoleId, grandChildRoleId });
    
    // Handle grandchild role updates (3rd level)
    if (parentRole && childRoleId && grandChildRoleId) {
      const parent = await Role.findById(parentRole);
      if (!parent) return res.status(404).json({ message: 'Parent role not found' });
      
      const childRole = parent.childRoles.id(childRoleId);
      if (!childRole) return res.status(404).json({ message: 'Child role not found' });
      
      const grandChildRole = childRole.childRoles.id(grandChildRoleId);
      if (!grandChildRole) return res.status(404).json({ message: 'Grandchild role not found' });
      
      // Update fields only if provided
      if (name !== undefined) grandChildRole.name = name;
      if (description !== undefined) grandChildRole.description = description;
      if (icon !== undefined) grandChildRole.icon = icon;
      if (status !== undefined) grandChildRole.status = status;
      
      if (permissions) {
        // Validate permissions for non-super admin users
        if (!req.user.isSuperAdmin) {
          const parentPerms = childRole.permissions || {};
          for (const [key, value] of Object.entries(permissions)) {
            if (value === true && parentPerms[key] !== true) {
              return res.status(400).json({ message: `Permission ${key} not available from parent role` });
            }
          }
        }
        grandChildRole.permissions = permissions;
      }
      
      if (nextSteps !== undefined) {
        grandChildRole.nextSteps = Array.isArray(nextSteps) ? nextSteps : [];
      }
      
      if (video !== undefined) {
        grandChildRole.video = Array.isArray(video) ? video : [];
      }
      
      parent.markModified('childRoles');
      await parent.save();
      
      console.log('Grandchild role updated successfully');
      return res.json({
        ...grandChildRole.toObject(),
        parentRoleId: childRoleId,
        grandParentRoleId: parentRole
      });
    }
    
    // Handle child role updates (2nd level)
    if (parentRole && childRoleId) {
      const parent = await Role.findById(parentRole);
      if (!parent) return res.status(404).json({ message: 'Parent role not found' });
      
      const childRole = parent.childRoles.id(childRoleId);
      if (!childRole) return res.status(404).json({ message: 'Child role not found' });
      
      // Update fields only if provided
      if (name !== undefined) childRole.name = name;
      if (description !== undefined) childRole.description = description;
      if (icon !== undefined) childRole.icon = icon;
      if (status !== undefined) childRole.status = status;
      
      if (permissions) {
        // Validate permissions for non-super admin users
        if (!req.user.isSuperAdmin) {
          const parentPerms = parent.effectivePermissions || parent.permissions || {};
          for (const [key, value] of Object.entries(permissions)) {
            if (value === true && parentPerms[key] !== true) {
              return res.status(400).json({ message: `Permission ${key} not available from parent role` });
            }
          }
        }
        
        childRole.permissions = permissions;
        
        // Cascade permission changes to grandchildren
        if (childRole.childRoles && childRole.childRoles.length > 0) {
          childRole.childRoles.forEach(grandChild => {
            const updatedGrandChildPerms = { ...grandChild.permissions };
            Object.keys(updatedGrandChildPerms).forEach(key => {
              // Disable grandchild permission if parent no longer has it
              if (updatedGrandChildPerms[key] === true && permissions[key] !== true) {
                updatedGrandChildPerms[key] = false;
              }
            });
            grandChild.permissions = updatedGrandChildPerms;
          });
        }
      }
      
      if (nextSteps !== undefined) {
        childRole.nextSteps = Array.isArray(nextSteps) ? nextSteps : [];
      }
      
      if (video !== undefined) {
        childRole.video = Array.isArray(video) ? video : [];
      }
      
      parent.markModified('childRoles');
      await parent.save();
      
      console.log('Child role updated successfully');
      return res.json({
        ...childRole.toObject(),
        parentRoleId: parentRole
      });
    }
    
    // Update parent role (1st level) with cascading
    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    
    // Update fields only if provided
    if (name !== undefined) role.name = name;
    if (description !== undefined) role.description = description;
    if (icon !== undefined) role.icon = icon;
    if (status !== undefined) role.status = status;
    
    if (permissions) {
      // Super admin can update any permissions directly
      if (req.user.isSuperAdmin) {
        role.ownPermissions = permissions;
        role.permissions = permissions;
        role.markModified('permissions');
        role.markModified('ownPermissions');
        
        // Cascade to children using inheritance service
        try {
          await PermissionInheritanceService.cascadePermissionsToChildren(id);
        } catch (cascadeError) {
          console.warn('Permission cascade warning:', cascadeError.message);
        }
      } else {
        // Use inheritance service for regular users
        try {
          await PermissionInheritanceService.updateRolePermissions(id, permissions);
        } catch (inheritanceError) {
          console.warn('Permission inheritance warning:', inheritanceError.message);
          // Fallback to direct update
          role.permissions = permissions;
          role.markModified('permissions');
        }
      }
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
    console.log('Parent role updated successfully');
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
      
      // Build dynamic menu based on permissions
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
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ nextSteps: role.nextSteps || [] });
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
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ childRoles: role.childRoles || [] });
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

    let role = await Role.findById(user.roleId);
    let parentRole = null;
    let isChildRole = false;
    let isGrandChildRole = false;
    
    // If role not found, search in childRoles
    if (!role) {
      const allRoles = await Role.find();
      for (const parent of allRoles) {
        if (parent.childRoles && parent.childRoles.length > 0) {
          const foundChild = parent.childRoles.find(child => child._id.toString() === user.roleId.toString());
          if (foundChild) {
            role = foundChild;
            parentRole = parent;
            isChildRole = true;
            break;
          }
          // Check in grandchild roles
          for (const childRole of parent.childRoles) {
            if (childRole.childRoles && childRole.childRoles.length > 0) {
              const foundGrandChild = childRole.childRoles.find(grandChild => grandChild._id.toString() === user.roleId.toString());
              if (foundGrandChild) {
                role = foundGrandChild;
                parentRole = parent;
                isGrandChildRole = true;
                break;
              }
            }
          }
          if (role) break;
        }
      }
    }
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Update role data
    if (name) role.name = name;
    if (description) role.description = description;
    if (icon !== undefined) role.icon = icon;
    if (status !== undefined) role.status = status;
    if (permissions) role.permissions = permissions;
    if (nextSteps) role.nextSteps = nextSteps;
    if (video !== undefined) role.video = video;

    // Save based on role type
    if (isChildRole || isGrandChildRole) {
      parentRole.markModified('childRoles');
      await parentRole.save();
    } else {
      if (permissions) role.markModified('permissions');
      if (nextSteps) role.markModified('nextSteps');
      if (video !== undefined) role.markModified('video');
      await role.save();
    }

    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Bulk permission update for multiple roles
const bulkUpdatePermissions = async (req, res) => {
  try {
    const { roleIds, permissions } = req.body;
    
    if (!Array.isArray(roleIds) || !permissions) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    const results = [];
    
    for (const roleId of roleIds) {
      try {
        const updatedRole = await PermissionInheritanceService.updateRolePermissions(roleId, permissions);
        results.push({ roleId, success: true, role: updatedRole });
      } catch (error) {
        results.push({ roleId, success: false, error: error.message });
      }
    }
    
    res.json({ results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get role hierarchy
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

    let role = await Role.findById(user.roleId);
    let parentRole = null;
    let isChildRole = false;
    let isGrandChildRole = false;
    
    // If role not found, search in childRoles
    if (!role) {
      const allRoles = await Role.find();
      for (const parent of allRoles) {
        if (parent.childRoles && parent.childRoles.length > 0) {
          const foundChild = parent.childRoles.find(child => child._id.toString() === user.roleId.toString());
          if (foundChild) {
            role = foundChild;
            parentRole = parent;
            isChildRole = true;
            break;
          }
          // Check in grandchild roles
          for (const childRole of parent.childRoles) {
            if (childRole.childRoles && childRole.childRoles.length > 0) {
              const foundGrandChild = childRole.childRoles.find(grandChild => grandChild._id.toString() === user.roleId.toString());
              if (foundGrandChild) {
                role = foundGrandChild;
                parentRole = parent;
                isGrandChildRole = true;
                break;
              }
            }
          }
          if (role) break;
        }
      }
    }
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (!role.nextSteps || stepIndex >= role.nextSteps.length) {
      return res.status(400).json({ message: 'Invalid step index' });
    }

    role.nextSteps[stepIndex].completed = completed;

    // Save based on role type
    if (isChildRole || isGrandChildRole) {
      parentRole.markModified('childRoles');
      await parentRole.save();
    } else {
      role.markModified('nextSteps');
      await role.save();
    }

    res.json({ success: true, nextSteps: role.nextSteps });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createRole, getAllRoles, getRoleById, updateRole, deleteRole, getDefaultPermissions, getFirstLevelRoles, getUserPermissions, getUserNextSteps, getUserVideos, getChildRoles, getUserOwnRole, updateUserOwnRole, bulkUpdatePermissions, getRoleHierarchy, updateUserNextStep };
