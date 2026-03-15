const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

const fixEmptyMemberFor = async () => {
  try {
    console.log('Starting memberfor fix migration...');
    
    // Find users with empty or missing memberfor arrays
    const usersWithEmptyMemberFor = await User.find({
      $or: [
        { memberfor: { $exists: false } },
        { memberfor: { $size: 0 } },
        { memberfor: null }
      ]
    }).populate('roleId');

    console.log(`Found ${usersWithEmptyMemberFor.length} users with empty memberfor arrays`);

    let fixedCount = 0;

    for (const user of usersWithEmptyMemberFor) {
      try {
        // Skip super admin users
        if (user.isSuperAdmin) {
          console.log(`Skipping super admin user: ${user.email}`);
          continue;
        }

        // Find Administrator subrole ID from the user's role
        let administratorRoleId = 'Administrator'; // Default fallback
        
        if (user.roleId && user.roleId.subRoles && user.roleId.subRoles.length > 0) {
          const adminSubRole = user.roleId.subRoles.find(subRole => 
            subRole.role && subRole.role.toLowerCase().includes('administrator')
          );
          if (adminSubRole) {
            administratorRoleId = adminSubRole.id; // Use the proper ID like "BO_004"
          }
        }

        // Add user to their own memberfor array
        user.memberfor = [{
          company: user._id, // User's own company ID
          role: administratorRoleId
        }];

        await user.save();
        fixedCount++;
        
        console.log(`Fixed memberfor for user: ${user.email} (${user.firstName} ${user.lastName})`);
      } catch (error) {
        console.error(`Error fixing user ${user.email}:`, error.message);
      }
    }

    console.log(`Migration completed. Fixed ${fixedCount} users.`);
    
    // Verify the fix
    const stillEmptyCount = await User.countDocuments({
      $or: [
        { memberfor: { $exists: false } },
        { memberfor: { $size: 0 } },
        { memberfor: null }
      ],
      isSuperAdmin: { $ne: true }
    });

    console.log(`Users still with empty memberfor: ${stillEmptyCount}`);
    
    return { fixed: fixedCount, remaining: stillEmptyCount };
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

module.exports = fixEmptyMemberFor;

// Run if called directly
if (require.main === module) {
  const connectDB = require('../config/database');
  
  const runMigration = async () => {
    try {
      await connectDB();
      await fixEmptyMemberFor();
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  };
  
  runMigration();
}