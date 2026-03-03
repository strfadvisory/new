const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

async function checkAndSeedRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const rolesCollection = db.collection('roles');
    const usersCollection = db.collection('users');

    // Check existing roles
    const existingRoles = await rolesCollection.find({}).toArray();
    console.log(`Found ${existingRoles.length} existing roles`);

    if (existingRoles.length > 0) {
      console.log('Existing roles:');
      existingRoles.forEach(role => {
        console.log(`- ${role.name} (${role._id})`);
      });
    }

    // Find super admin user
    const superAdmin = await usersCollection.findOne({ isSuperAdmin: true });
    if (!superAdmin) {
      console.log('No super admin found');
      return;
    }

    console.log(`Super admin found: ${superAdmin.email}`);

    // If no roles exist, create default ones
    if (existingRoles.length === 0) {
      console.log('Creating default roles...');
      
      const defaultRoles = [
        {
          name: 'Administrator',
          icon: 'user-shield',
          type: 'master',
          parentId: null,
          status: true,
          permissions: {},
          nextSteps: [
            { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members and modules.', icon: 'user', completed: false },
            { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members and modules.', icon: 'building', completed: false },
            { title: 'Upload Reserve Study Data', description: 'Set up a new organizational entity to manage members and modules.', icon: 'file', completed: false },
            { title: 'Schedule meeting with Expert', description: 'Set up a new organizational entity to manage members and modules.', icon: 'calendar', completed: false }
          ],
          video: [],
          createdBy: superAdmin._id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Manager',
          icon: 'user-tie',
          type: 'master',
          parentId: null,
          status: true,
          permissions: {},
          nextSteps: [
            { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members and modules.', icon: 'user', completed: false },
            { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members and modules.', icon: 'building', completed: false }
          ],
          video: [],
          createdBy: superAdmin._id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = await rolesCollection.insertMany(defaultRoles);
      console.log(`Created ${result.insertedCount} default roles`);
    }

    console.log('Role check and seed completed successfully');
    
  } catch (error) {
    console.error('Error during role check/seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  checkAndSeedRoles();
}

module.exports = checkAndSeedRoles;