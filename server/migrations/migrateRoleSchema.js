const mongoose = require('mongoose');
const Role = require('./models/Role');
require('dotenv').config();

const migrateRolesToNewSchema = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all existing roles
    const roles = await Role.find({});
    console.log(`Found ${roles.length} roles to migrate`);

    for (const role of roles) {
      let hasChanges = false;

      // Initialize new fields if they don't exist
      if (!role.ownPermissions) {
        role.ownPermissions = role.permissions || {};
        hasChanges = true;
      }

      if (!role.inheritedPermissions) {
        role.inheritedPermissions = {};
        hasChanges = true;
      }

      if (role.level === undefined) {
        role.level = 0; // Default to root level
        hasChanges = true;
      }

      if (!role.hierarchyPath) {
        role.hierarchyPath = [];
        hasChanges = true;
      }

      // Set up hierarchy for nested child roles
      if (role.childRoles && role.childRoles.length > 0) {
        for (const childRole of role.childRoles) {
          // Create separate Role documents for child roles
          const newChildRole = new Role({
            name: childRole.name,
            type: childRole.type,
            description: childRole.description,
            icon: childRole.icon,
            status: childRole.status,
            ownPermissions: childRole.permissions || {},
            inheritedPermissions: role.ownPermissions || role.permissions || {},
            parentRoleId: role._id,
            level: 1,
            hierarchyPath: [role._id],
            nextSteps: childRole.nextSteps || [],
            video: childRole.video || [],
            createdBy: role.createdBy
          });

          await newChildRole.save();
          console.log(`Created child role: ${childRole.name}`);

          // Handle grandchild roles
          if (childRole.childRoles && childRole.childRoles.length > 0) {
            for (const grandChildRole of childRole.childRoles) {
              const newGrandChildRole = new Role({
                name: grandChildRole.name,
                type: grandChildRole.type,
                description: grandChildRole.description,
                icon: grandChildRole.icon,
                status: grandChildRole.status,
                ownPermissions: grandChildRole.permissions || {},
                inheritedPermissions: childRole.permissions || {},
                parentRoleId: newChildRole._id,
                level: 2,
                hierarchyPath: [role._id, newChildRole._id],
                nextSteps: grandChildRole.nextSteps || [],
                video: grandChildRole.video || [],
                createdBy: role.createdBy
              });

              await newGrandChildRole.save();
              console.log(`Created grandchild role: ${grandChildRole.name}`);
            }
          }
        }

        // Clear nested childRoles from parent (they're now separate documents)
        role.childRoles = [];
        hasChanges = true;
      }

      if (hasChanges) {
        await role.save();
        console.log(`Migrated role: ${role.name}`);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run migration
if (require.main === module) {
  migrateRolesToNewSchema();
}

module.exports = migrateRolesToNewSchema;