const Role = require('../models/Role');

class PermissionInheritanceService {
  
  static async calculateInheritedPermissions(roleId) {
    const role = await Role.findById(roleId);
    if (!role || !role.parentRoleId) return {};
    
    const parent = await Role.findById(role.parentRoleId);
    if (!parent) return {};
    
    return parent.effectivePermissions || parent.permissions || {};
  }
  
  static async updateRolePermissions(roleId, newOwnPermissions) {
    const role = await Role.findById(roleId);
    if (!role) throw new Error('Role not found');
    
    const inheritedPermissions = await this.calculateInheritedPermissions(roleId);
    
    if (role.parentRoleId) {
      const parentPermissions = inheritedPermissions;
      for (const [key, value] of Object.entries(newOwnPermissions)) {
        if (value === true && parentPermissions[key] !== true) {
          throw new Error(`Permission ${key} not available from parent role`);
        }
      }
    }
    
    role.inheritedPermissions = inheritedPermissions;
    role.ownPermissions = newOwnPermissions;
    role.markModified('inheritedPermissions');
    role.markModified('ownPermissions');
    await role.save();
    
    await this.cascadePermissionsToChildren(roleId);
    
    return role;
  }
  
  static async cascadePermissionsToChildren(parentRoleId) {
    const parentRole = await Role.findById(parentRoleId);
    if (!parentRole) return;
    
    const childRoles = await Role.find({ parentRoleId });
    
    for (const child of childRoles) {
      const newInherited = parentRole.effectivePermissions || parentRole.permissions || {};
      const updatedOwnPermissions = { ...child.ownPermissions };
      
      for (const [key, value] of Object.entries(updatedOwnPermissions)) {
        if (value === true && newInherited[key] !== true) {
          updatedOwnPermissions[key] = false;
        }
      }
      
      child.inheritedPermissions = newInherited;
      child.ownPermissions = updatedOwnPermissions;
      child.markModified('inheritedPermissions');
      child.markModified('ownPermissions');
      await child.save();
      
      await this.cascadePermissionsToChildren(child._id);
    }
  }
  
  static async setupRoleHierarchy(childRoleId, parentRoleId) {
    const childRole = await Role.findById(childRoleId);
    const parentRole = await Role.findById(parentRoleId);
    
    if (!childRole || !parentRole) throw new Error('Role not found');
    
    childRole.parentRoleId = parentRoleId;
    childRole.level = (parentRole.level || 0) + 1;
    childRole.hierarchyPath = [...(parentRole.hierarchyPath || []), parentRoleId];
    
    await this.updateRolePermissions(childRoleId, childRole.ownPermissions || childRole.permissions || {});
    
    return childRole;
  }
  
  static async removeFromHierarchy(roleId) {
    const role = await Role.findById(roleId);
    if (!role) return;
    
    const children = await Role.find({ parentRoleId: roleId });
    for (const child of children) {
      child.parentRoleId = role.parentRoleId;
      child.level = Math.max(0, (child.level || 1) - 1);
      child.hierarchyPath = role.hierarchyPath || [];
      await child.save();
    }
    
    role.parentRoleId = null;
    role.level = 0;
    role.hierarchyPath = [];
    role.inheritedPermissions = {};
    await role.save();
  }
}

module.exports = PermissionInheritanceService;
