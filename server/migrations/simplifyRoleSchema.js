const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

async function simplifyRoleSchema() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const rolesCollection = db.collection('roles');

    // Update all existing roles to new simplified schema
    const result = await rolesCollection.updateMany(
      {},
      {
        $set: {
          type: 'master',
          parentId: null
        },
        $unset: {
          description: '',
          inheritedPermissions: '',
          hierarchyPath: '',
          parentRoleId: '',
          level: '',
          ownPermissions: '',
          effectivePermissions: ''
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} roles to simplified schema`);

    // Make icon required for roles that don't have one
    const rolesWithoutIcon = await rolesCollection.updateMany(
      { icon: { $exists: false } },
      { $set: { icon: 'user' } }
    );

    console.log(`Added default icon to ${rolesWithoutIcon.modifiedCount} roles`);

    console.log('Role schema simplification completed successfully');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  simplifyRoleSchema();
}

module.exports = simplifyRoleSchema;