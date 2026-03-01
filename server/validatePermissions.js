const mongoose = require('mongoose');
const Role = require('./models/Role');
const PermissionInheritanceService = require('./services/permissionInheritanceService');
require('dotenv').config();

const validatePermissionConsistency = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for validation');

    const roles = await Role.find({}).populate('parentRoleId');
    let inconsistencies = [];

    for (const role of roles) {
      // Check if child has permissions parent doesn't have
      if (role.parentRoleId) {
        const parentPerms = role.parentRoleId.effectivePermissions || role.parentRoleId.permissions || {};
        const childPerms = role.ownPermissions || role.permissions || {};

        for (const [key, value] of Object.entries(childPerms)) {
          if (value === true && parentPerms[key] !== true) {
            inconsistencies.push({
              roleId: role._id,
              roleName: role.name,
              parentName: role.parentRoleId.name,
              issue: `Child has permission '${key}' that parent lacks`,
              severity: 'HIGH'
            });
          }
        }
      }

      // Check hierarchy path consistency
      if (role.hierarchyPath && role.hierarchyPath.length > 0) {
        for (const ancestorId of role.hierarchyPath) {
          const ancestor = await Role.findById(ancestorId);
          if (!ancestor) {
            inconsistencies.push({
              roleId: role._id,
              roleName: role.name,
              issue: `Invalid ancestor reference: ${ancestorId}`,
              severity: 'MEDIUM'
            });
          }
        }
      }

      // Check level consistency
      if (role.parentRoleId && role.level <= (role.parentRoleId.level || 0)) {
        inconsistencies.push({
          roleId: role._id,
          roleName: role.name,
          issue: `Invalid level: ${role.level}, parent level: ${role.parentRoleId.level}`,
          severity: 'MEDIUM'
        });
      }
    }

    if (inconsistencies.length === 0) {
      console.log('✅ All roles have consistent permissions and hierarchy');
    } else {
      console.log(`❌ Found ${inconsistencies.length} inconsistencies:`);
      inconsistencies.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity}] ${issue.roleName}: ${issue.issue}`);
      });
    }

    return inconsistencies;
  } catch (error) {
    console.error('Validation failed:', error);
    return [];
  } finally {
    await mongoose.disconnect();
  }
};

const fixPermissionInconsistencies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for fixing inconsistencies');

    const roles = await Role.find({ parentRoleId: { $exists: true } }).populate('parentRoleId');
    let fixedCount = 0;

    for (const role of roles) {
      if (role.parentRoleId) {
        const parentPerms = role.parentRoleId.effectivePermissions || role.parentRoleId.permissions || {};
        const childPerms = { ...role.ownPermissions } || { ...role.permissions } || {};
        let hasChanges = false;

        // Remove permissions child has that parent doesn't
        for (const [key, value] of Object.entries(childPerms)) {
          if (value === true && parentPerms[key] !== true) {
            childPerms[key] = false;
            hasChanges = true;
            console.log(`Fixed: Removed '${key}' from ${role.name}`);
          }
        }

        if (hasChanges) {
          role.ownPermissions = childPerms;
          role.permissions = role.effectivePermissions;
          await role.save();
          fixedCount++;
        }
      }
    }

    console.log(`✅ Fixed ${fixedCount} roles with permission inconsistencies`);
  } catch (error) {
    console.error('Fix operation failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'validate') {
    validatePermissionConsistency();
  } else if (command === 'fix') {
    fixPermissionInconsistencies();
  } else {
    console.log('Usage:');
    console.log('  node validatePermissions.js validate  - Check for inconsistencies');
    console.log('  node validatePermissions.js fix       - Fix permission inconsistencies');
  }
}

module.exports = { validatePermissionConsistency, fixPermissionInconsistencies };