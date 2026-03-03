const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/your-database';

const createSuperAdmin = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB for seeding');
    }
    
    // Delete existing super admin if exists
    await User.deleteOne({ email: 'admin@reservefundadvisory.com' });

    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@reservefundadvisory.com',
      designation: 'System Administrator',
      phone: '1234567890',
      password: 'Admin@123',
      address: {
        zipCode: '00000',
        state: 'FL',
        city: 'Tampa',
        address1: 'Admin Office',
        address2: ''
      },
      role: 'SUPER_ADMIN',
      isSuperAdmin: true,
      isVerified: true
    });

    console.log('Super admin created successfully');
    console.log('Email: admin@reservefundadvisory.com');
    console.log('Password: Admin@123');
  } catch (error) {
    console.error('Error creating super admin:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  createSuperAdmin().finally(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}

module.exports = createSuperAdmin;
