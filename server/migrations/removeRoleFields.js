const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

async function removeRoleFields() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const rolesCollection = db.collection('roles');

    // Remove the specified fields from all role documents
    const result = await rolesCollection.updateMany(
      {},
      {
        $unset: {
          type: "",
          userType: "",
          level: "",
          parentRoleId: "",
          ownPermissions: ""
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} role documents`);

    // Drop indexes related to removed fields
    try {
      await rolesCollection.dropIndex('parentRoleId_1');
      console.log('Dropped parentRoleId index');
    } catch (error) {
      console.log('parentRoleId index not found or already dropped');
    }

    try {
      await rolesCollection.dropIndex('level_1');
      console.log('Dropped level index');
    } catch (error) {
      console.log('level index not found or already dropped');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  removeRoleFields();
}

module.exports = removeRoleFields;