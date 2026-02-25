const mongoose = require('mongoose');
require('dotenv').config();

const dropOrgIdIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/simulator');
    
    const User = mongoose.connection.collection('users');
    
    // Drop the orgId_1 index
    try {
      await User.dropIndex('orgId_1');
      console.log('Successfully dropped orgId_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('Index orgId_1 does not exist, skipping...');
      } else {
        throw error;
      }
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

dropOrgIdIndex();
