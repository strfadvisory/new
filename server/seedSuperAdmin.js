const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/myapp');
    
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
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
