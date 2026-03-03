const mongoose = require('mongoose');
const Role = require('../models/Role');
const masterDataService = require('../services/masterDataService');

const migrateToArrayPermissions = async () => {
  try {
    console.log('Starting migration to array-based permissions...');
    
    const roles = await Role.find({});
    console.log(`Found ${roles.length} roles to migrate`);
    
    for (const role of roles) {
      const updates = {};
      
      // Convert permissions object to array
      if (role.permissions && typeof role.permissions === 'object' && !Array.isArray(role.permissions)) {
        const permissionIds = [];
        Object.keys(role.permissions).forEach(key => {
          if (role.permissions[key] === true) {
            const permId = mapOldPermissionToId(key);
            if (permId) permissionIds.push(permId);
          }
        });
        updates.permissions = permissionIds;
      }
      
      // Convert nextSteps to array of IDs
      if (role.nextSteps && Array.isArray(role.nextSteps) && role.nextSteps.length > 0) {
        if (typeof role.nextSteps[0] === 'object') {
          updates.nextSteps = ['NS_001', 'NS_002', 'NS_003', 'NS_004']; // Default mapping
        }
      } else {
        updates.nextSteps = [];
      }
      
      // Convert videos to array of IDs
      if (role.video && Array.isArray(role.video) && role.video.length > 0) {
        if (typeof role.video[0] === 'object') {
          updates.videos = ['VID_001', 'VID_002']; // Default mapping
        }
      } else {
        updates.videos = [];
      }
      
      // Update role
      await Role.findByIdAndUpdate(role._id, updates);
      console.log(`Migrated role: ${role.name}`);\n    }\n    \n    console.log('Migration completed successfully!');\n  } catch (error) {\n    console.error('Migration failed:', error);\n  }\n};\n\nfunction mapOldPermissionToId(oldKey) {\n  const mapping = {\n    'SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR': 'PERM_001',\n    'SIMULATOR_MANAGEMENT.UPLOAD_MODEL': 'PERM_002',\n    'SIMULATOR_MANAGEMENT.CREATE_VERSION': 'PERM_003',\n    'INVITATION_ONBOARDING.INVITE_MEMBERS': 'PERM_011',\n    'COMPANY_CONTROL.CREATE_COMPANY': 'PERM_016',\n    'ASSOCIATION_CONTROL.CREATE_SINGLE_ASSOCIATION': 'PERM_019',\n    'USER_MANAGEMENT.MANAGE_USERS': 'PERM_027',\n    'ROLE_MANAGEMENT.EDIT_ROLE': 'PERM_029',\n    'BANKING_SERVICES.MANAGE_CD_PLANS': 'PERM_032'\n  };\n  return mapping[oldKey];\n}\n\nmodule.exports = { migrateToArrayPermissions };