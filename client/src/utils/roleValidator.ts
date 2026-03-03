// Role validation utilities
export interface RoleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RoleData {
  _id?: string;
  name: string;
  description: string;
  icon: string;
  status: boolean;
  permissions: Record<string, boolean>;
  nextSteps?: any[];
  video?: any[];
}

export class RoleValidator {
  static validateRoleData(roleData: RoleData): RoleValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!roleData.name || roleData.name.trim().length === 0) {
      errors.push('Role name is required');
    }

    if (!roleData.description || roleData.description.trim().length === 0) {
      errors.push('Role description is required');
    }

    if (!roleData.icon || roleData.icon.trim().length === 0) {
      errors.push('Role icon is required');
    }

    // Name length validation
    if (roleData.name && roleData.name.length > 100) {
      errors.push('Role name must be less than 100 characters');
    }

    // Permissions validation
    if (!roleData.permissions || typeof roleData.permissions !== 'object') {
      errors.push('Permissions must be provided as an object');
    } else {
      const permissionCount = Object.keys(roleData.permissions).length;
      if (permissionCount === 0) {
        warnings.push('No permissions are defined for this role');
      }

      // Check for valid permission format
      Object.entries(roleData.permissions).forEach(([key, value]) => {
        if (typeof value !== 'boolean') {
          errors.push(`Permission ${key} must have a boolean value`);
        }
        if (!key.includes('.')) {
          warnings.push(`Permission ${key} does not follow module.permission format`);
        }
      });
    }

    // Next steps validation
    if (roleData.nextSteps && Array.isArray(roleData.nextSteps)) {
      roleData.nextSteps.forEach((step, index) => {
        if (!step.title || step.title.trim().length === 0) {
          errors.push(`Next step ${index + 1} must have a title`);
        }
        if (!step.description || step.description.trim().length === 0) {
          errors.push(`Next step ${index + 1} must have a description`);
        }
        if (typeof step.completed !== 'boolean') {
          errors.push(`Next step ${index + 1} completed status must be boolean`);
        }
      });
    }

    // Video validation
    if (roleData.video && Array.isArray(roleData.video)) {
      roleData.video.forEach((video, index) => {
        if (!video._id) {
          errors.push(`Video ${index + 1} must have an ID`);
        }
        if (!video.title || video.title.trim().length === 0) {
          errors.push(`Video ${index + 1} must have a title`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validatePermissionInheritance(
    childPermissions: Record<string, boolean>,
    parentPermissions: Record<string, boolean>
  ): RoleValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    Object.entries(childPermissions).forEach(([key, value]) => {
      if (value === true && parentPermissions[key] !== true) {
        errors.push(`Permission ${key} is not available from parent role`);
      }
    });

    // Check for unused parent permissions
    const enabledChildPerms = Object.keys(childPermissions).filter(key => childPermissions[key]);
    const enabledParentPerms = Object.keys(parentPermissions).filter(key => parentPermissions[key]);
    
    if (enabledChildPerms.length === 0 && enabledParentPerms.length > 0) {
      warnings.push('Child role has no permissions enabled despite parent having available permissions');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static sanitizeRoleData(roleData: RoleData): RoleData {
    return {
      ...roleData,
      name: roleData.name?.trim() || '',
      description: roleData.description?.trim() || '',
      icon: roleData.icon?.trim() || '',
      status: Boolean(roleData.status),
      permissions: roleData.permissions || {},
      nextSteps: Array.isArray(roleData.nextSteps) ? roleData.nextSteps : [],
      video: Array.isArray(roleData.video) ? roleData.video : []
    };
  }

  static compareRoleData(original: RoleData, updated: RoleData): string[] {
    const changes: string[] = [];

    if (original.name !== updated.name) {
      changes.push(`Name changed from "${original.name}" to "${updated.name}"`);
    }

    if (original.icon !== updated.icon) {
      changes.push('Icon updated');
    }

    if (original.status !== updated.status) {
      changes.push(`Status changed to ${updated.status ? 'Active' : 'Inactive'}`);
    }

    // Compare permissions
    const originalPerms = Object.keys(original.permissions || {});
    const updatedPerms = Object.keys(updated.permissions || {});
    
    const addedPerms = updatedPerms.filter(key => 
      updated.permissions[key] === true && original.permissions?.[key] !== true
    );
    
    const removedPerms = originalPerms.filter(key => 
      original.permissions[key] === true && updated.permissions?.[key] !== true
    );

    if (addedPerms.length > 0) {
      changes.push(`Added permissions: ${addedPerms.join(', ')}`);
    }

    if (removedPerms.length > 0) {
      changes.push(`Removed permissions: ${removedPerms.join(', ')}`);
    }

    // Compare next steps
    const originalStepsCount = original.nextSteps?.length || 0;
    const updatedStepsCount = updated.nextSteps?.length || 0;
    
    if (originalStepsCount !== updatedStepsCount) {
      changes.push(`Next steps count changed from ${originalStepsCount} to ${updatedStepsCount}`);
    }

    // Compare videos
    const originalVideosCount = original.video?.length || 0;
    const updatedVideosCount = updated.video?.length || 0;
    
    if (originalVideosCount !== updatedVideosCount) {
      changes.push(`Videos count changed from ${originalVideosCount} to ${updatedVideosCount}`);
    }

    return changes;
  }
}

export default RoleValidator;