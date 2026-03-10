const clearDatabase = require('./clearDatabase');
const seedSuperAdmin = require('./seedSuperAdmin');
const seedDefaultRoles = require('./seedDefaultRoles');
const mongoose = require('mongoose');

async function clearAndSeed() {
  try {
    console.log('Starting database clear and seed process...');
    
    // Clear database first
    await clearDatabase();
    
    // Seed super admin
    await seedSuperAdmin();
    
    // Seed default master roles
    await seedDefaultRoles();
    
    console.log('Clear and seed process completed successfully');
    
  } catch (error) {
    console.error('Error during clear and seed process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

clearAndSeed();