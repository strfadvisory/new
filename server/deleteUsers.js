const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const deleteUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/myapp');
    
    const result = await User.deleteMany({ isSuperAdmin: { $ne: true } });
    
    console.log(`Deleted ${result.deletedCount} users (excluding super admin)`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting users:', error);
    process.exit(1);
  }
};

deleteUsers();
