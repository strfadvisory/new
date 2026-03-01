const Role = require('../models/Role');

class PermissionInheritanceService {
  
  // Calculate inherited permissions from parent hierarchy
  static async calculateInheritedPermissions(roleId) {
    const role = await Role.findById(roleId);
    if (!role || !role.parentRoleId) return {};
    
    const parent = await Role.findById(role.parentRoleId);
    if (!parent) return {};
    
    return parent.effectivePermissions || parent.permissions || {};
  }
  
  // Update role permissions with inheritance
  static async updateRolePermissions(roleId, newOwnPermissions) {
    const role = await Role.findById(roleId);
    if (!role) throw new Error('Role not found');
    
    const inheritedPermissions = await this.calculateInheritedPermissions(roleId);
    
    // Skip validation for root level roles (they have no parent)
    if (role.parentRoleId) {
      // Validate: child can't have permissions parent doesn't have
      const parentPermissions = inheritedPermissions;
      for (const [key, value] of Object.entries(newOwnPermissions)) {
        if (value === true && parentPermissions[key] !== true) {
          throw new Error(`Permission ${key} not available from parent role`);
        }
      }
    }
    
    role.inheritedPermissions = inheritedPermissions;
    role.ownPermissions = newOwnPermissions;
    await role.save();
    
    // Cascade to children
    await this.cascadePermissionsToChildren(roleId);
    
    return role;
  }
  
  // Cascade permission changes to all descendants
  static async cascadePermissionsToChildren(parentRoleId) {
    const parentRole = await Role.findById(parentRoleId);
    if (!parentRole) return;
    
    // Update direct children
    const childRoles = await Role.find({ parentRoleId });
    
    for (const child of childRoles) {
      const newInherited = parentRole.effectivePermissions || parentRole.permissions || {};
      
      // Remove permissions from child that parent no longer has
      const updatedOwnPermissions = { ...child.ownPermissions };
      for (const [key, value] of Object.entries(updatedOwnPermissions)) {
        if (value === true && newInherited[key] !== true) {
          updatedOwnPermissions[key] = false;
        }
      }
      
      child.inheritedPermissions = newInherited;
      child.ownPermissions = updatedOwnPermissions;
      await child.save();
      
      // Recursively update grandchildren
      await this.cascadePermissionsToChildren(child._id);
    }
    
    // Update nested childRoles in parent document
    if (parentRole.childRoles && parentRole.childRoles.length > 0) {
      await this.updateNestedChildRoles(parentRole);
    }
  }
  
  // Update nested child roles in parent document
  static async updateNestedChildRoles(parentRole) {
    let hasChanges = false;
    
    for (const childRole of parentRole.childRoles) {
      const newInherited = parentRole.effectivePermissions || parentRole.permissions || {};
      
      // Update child permissions
      const updatedOwnPermissions = { ...childRole.permissions };
      for (const [key, value] of Object.entries(updatedOwnPermissions)) {
        if (value === true && newInherited[key] !== true) {
          updatedOwnPermissions[key] = false;
          hasChanges = true;
        }
      }
      
      childRole.permissions = updatedOwnPermissions;
      
      // Update grandchild roles
      if (childRole.childRoles && childRole.childRoles.length > 0) {
        for (const grandChildRole of childRole.childRoles) {
          const grandChildUpdated = { ...grandChildRole.permissions };
          for (const [key, value] of Object.entries(grandChildUpdated)) {
            if (value === true && updatedOwnPermissions[key] !== true) {
              grandChildUpdated[key] = false;
              hasChanges = true;
            }
          }
          grandChildRole.permissions = grandChildUpdated;
        }
      }
    }
    
    if (hasChanges) {
      parentRole.markModified('childRoles');
      await parentRole.save();
    }
  }
  
  // Setup role hierarchy
  static async setupRoleHierarchy(childRoleId, parentRoleId) {
    const childRole = await Role.findById(childRoleId);
    const parentRole = await Role.findById(parentRoleId);
    
    if (!childRole || !parentRole) throw new Error('Role not found');
    
    // Set hierarchy fields
    childRole.parentRoleId = parentRoleId;
    childRole.level = (parentRole.level || 0) + 1;
    childRole.hierarchyPath = [...(parentRole.hierarchyPath || []), parentRoleId];
    
    // Update permissions
    await this.updateRolePermissions(childRoleId, childRole.ownPermissions || childRole.permissions || {});
    
    return childRole;
  }
  
  // Remove role from hierarchy
  static async removeFromHierarchy(roleId) {
    const role = await Role.findById(roleId);
    if (!role) return;
    
    // Move children up one level
    const children = await Role.find({ parentRoleId: roleId });
    for (const child of children) {
      child.parentRoleId = role.parentRoleId;
      child.level = Math.max(0, (child.level || 1) - 1);
      child.hierarchyPath = role.hierarchyPath || [];
      await child.save();
    }
    
    // Clear hierarchy fields
    role.parentRoleId = undefined;
    role.level = 0;
    role.hierarchyPath = [];
    role.inheritedPermissions = {};
    await role.save();
  }
}

module.exports = PermissionInheritanceService;