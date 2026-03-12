const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/your-database';

const assignRoleToSuperAdmin = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    }

    // Find super admin
    const superAdmin = await User.findOne({ email: 'admin@reservefundadvisory.com' });
    if (!superAdmin) {
      console.log('Super admin not found. Please run seedSuperAdmin first.');
      return;
    }

    // Check if super admin already has a role
    if (superAdmin.roleId) {
      const existingRole = await Role.findById(superAdmin.roleId);
      if (existingRole && existingRole.subRoles && existingRole.subRoles.length > 0) {
        console.log('✅ Super admin already has a role with subRoles');
        console.log(`Current Role: ${existingRole.name}`);
        console.log(`SubRoles count: ${existingRole.subRoles.length}`);
        console.log('SubRoles:', existingRole.subRoles.map(sr => `${sr.role} (${sr.permissionLevel})`).join(', '));
        return;
      }
    }

    // Find a role with subRoles (preferably Management Company for super admin)
    let roleWithSubRoles = await Role.findOne({ 
      name: { $regex: /Management Company/i },
      type: 'Master',
      status: true,
      subRoles: { $exists: true, $ne: [] }
    });

    if (!roleWithSubRoles) {
      // If Management Company not found, try Board Members
      roleWithSubRoles = await Role.findOne({ 
        name: { $regex: /Board Members/i },
        type: 'Master',
        status: true,
        subRoles: { $exists: true, $ne: [] }
      });
    }

    if (!roleWithSubRoles) {
      // If still not found, find any role with subRoles
      roleWithSubRoles = await Role.findOne({ 
        type: 'Master',
        status: true,
        subRoles: { $exists: true, $ne: [] }
      });
    }

    if (!roleWithSubRoles) {
      console.log('❌ No roles with subRoles found. Please run seedDefaultRoles first.');
      console.log('Available roles:');
      const allRoles = await Role.find({});
      allRoles.forEach(role => {
        console.log(`- ${role.name} (subRoles: ${role.subRoles?.length || 0})`);
      });
      return;
    }

    // Assign role to super admin
    superAdmin.roleId = roleWithSubRoles._id;
    superAdmin.companyType = roleWithSubRoles.name;
    await superAdmin.save();

    console.log('✅ Successfully assigned role to super admin');
    console.log(`Role: ${roleWithSubRoles.name}`);
    console.log(`SubRoles count: ${roleWithSubRoles.subRoles?.length || 0}`);
    console.log('SubRoles:', roleWithSubRoles.subRoles?.map(sr => `${sr.role} (${sr.permissionLevel})`).join(', '));
    console.log('\n🎯 Now the super admin can invite members with these specific subRoles only.');

  } catch (error) {
    console.error('Error assigning role to super admin:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  assignRoleToSuperAdmin().finally(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}

module.exports = assignRoleToSuperAdmin;