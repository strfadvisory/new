const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

const fixMemberForStructure = async () => {
  try {
    console.log('Starting memberFor structure migration...');
    
    // Find all users with memberfor array
    const users = await User.find({ memberfor: { $exists: true, $ne: [] } });
    
    console.log(`Found ${users.length} users with memberfor data`);
    
    for (const user of users) {
      let needsUpdate = false;
      const updatedMemberFor = [];
      
      for (const member of user.memberfor) {
        // Check if it's old structure (just ObjectId) or new structure (object with company/role)
        if (typeof member === 'string' || member instanceof mongoose.Types.ObjectId) {
          // Old structure - convert to new structure
          console.log(`Converting memberfor for user ${user.email}: ${member}`);
          
          // Find the role for this company
          const companyUser = await User.findById(member);
          if (companyUser && companyUser.roleId) {
            const role = await Role.findById(companyUser.roleId);
            let administratorRoleId = 'Administrator'; // Default
            
            if (role && role.subRoles && role.subRoles.length > 0) {
              const adminSubRole = role.subRoles.find(subRole => 
                subRole.role && subRole.role.toLowerCase().includes('administrator')
              );
              if (adminSubRole) {
                administratorRoleId = adminSubRole.id;
              }
            }
            
            updatedMemberFor.push({
              company: member,
              role: administratorRoleId
            });
            needsUpdate = true;
          } else {
            // Keep as is if company not found
            updatedMemberFor.push({
              company: member,
              role: 'Administrator'
            });
            needsUpdate = true;
          }
        } else if (member.company && member.role) {
          // Already new structure
          updatedMemberFor.push(member);
        } else if (member.companyId) {
          // Handle old companyId structure
          console.log(`Converting companyId structure for user ${user.email}: ${member.companyId}`);
          updatedMemberFor.push({
            company: member.companyId,
            role: member.role || 'Administrator'
          });
          needsUpdate = true;
        } else {
          // Unknown structure, keep as is
          updatedMemberFor.push(member);
        }
      }
      
      if (needsUpdate) {
        user.memberfor = updatedMemberFor;
        await user.save();
        console.log(`Updated memberfor structure for user: ${user.email}`);
      }
    }
    
    console.log('MemberFor structure migration completed successfully');
  } catch (error) {
    console.error('Error during memberFor migration:', error);
    throw error;
  }
};

module.exports = fixMemberForStructure;

// Run migration if called directly
if (require.main === module) {
  const runMigration = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/strf');
      console.log('Connected to MongoDB');
      
      await fixMemberForStructure();
      
      console.log('Migration completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  };
  
  runMigration();
}