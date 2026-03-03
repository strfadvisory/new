require('dotenv').config();
const mongoose = require('mongoose');
const { migrateToArrayPermissions } = require('./migrations/migrateToArrayPermissions');

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await migrateToArrayPermissions();
    
    await mongoose.disconnect();
    console.log('Migration completed and disconnected from MongoDB');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();