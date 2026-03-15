const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

const testMemberForStructure = async () => {
  try {
    console.log('Testing memberfor structure and role ID mapping...\n');
    
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/your-database';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Test 1: Check Role structure and subRoles
    console.log('=== TEST 1: Role Structure ===');
    const roles = await Role.find({ type: 'Master' }).select('name subRoles');
    
    roles.forEach(role => {
      console.log(`Role: ${role.name}`);
      if (role.subRoles && role.subRoles.length > 0) {
        role.subRoles.forEach(subRole => {
          console.log(`  - ${subRole.id}: ${subRole.role} (${subRole.permissionLevel})`);
        });
      } else {
        console.log('  - No subRoles found');
      }
      console.log('');
    });
    
    // Test 2: Check Users with memberfor
    console.log('=== TEST 2: Users with memberfor ===');
    const usersWithMemberFor = await User.find({
      memberfor: { $exists: true, $ne: [] },
      isSuperAdmin: { $ne: true }
    })
    .populate('roleId', 'name subRoles')
    .populate({
      path: 'memberfor.company',
      select: 'companyProfile firstName lastName'
    })
    .select('firstName lastName email memberfor roleId companyProfile')
    .limit(10);
    
    console.log(`Found ${usersWithMemberFor.length} users with memberfor entries:\n`);
    
    usersWithMemberFor.forEach(user => {
      console.log(`User: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`Role: ${user.roleId?.name || 'No role'}`);
      
      if (user.memberfor && user.memberfor.length > 0) {
        user.memberfor.forEach((member, index) => {
          const companyName = member.company?.companyProfile?.companyName || 
                             `${member.company?.firstName} ${member.company?.lastName}` || 
                             'Unknown Company';
          
          console.log(`  memberfor[${index}]:`);
          console.log(`    Company: ${companyName} (ID: ${member.company?._id})`);
          console.log(`    Role: ${member.role}`);
          
          // Check if role ID exists in user's roleId.subRoles
          if (user.roleId && user.roleId.subRoles) {
            const matchingSubRole = user.roleId.subRoles.find(sr => sr.id === member.role);
            if (matchingSubRole) {
              console.log(`    ✅ Role ID "${member.role}" found in subRoles: ${matchingSubRole.role} (${matchingSubRole.permissionLevel})`);
            } else {
              console.log(`    ⚠️  Role ID "${member.role}" not found in subRoles`);
            }
          }
        });
      }
      console.log('');
    });
    
    // Test 3: Test getUserMemberInfo logic
    console.log('=== TEST 3: getUserMemberInfo Logic Simulation ===');
    if (usersWithMemberFor.length > 0) {
      const testUser = usersWithMemberFor[0];
      console.log(`Testing with user: ${testUser.firstName} ${testUser.lastName}`);
      
      if (testUser.memberfor && testUser.memberfor.length > 0) {
        const firstMember = testUser.memberfor[0];
        const companyName = firstMember.company?.companyProfile?.companyName || 
                           `${firstMember.company?.firstName} ${firstMember.company?.lastName}` || 
                           'Unknown Company';
        
        let userRole = 'User';
        if (testUser.roleId && testUser.roleId.subRoles && firstMember.role) {
          const subRole = testUser.roleId.subRoles.find(sr => sr.id === firstMember.role);
          if (subRole) {
            userRole = subRole.role;
          } else {
            userRole = firstMember.role;
          }
        }
        
        console.log(`Expected API Response:`);
        console.log(`  companyName: "${companyName}"`);
        console.log(`  userRole: "${userRole}"`);
        console.log(`  currentCompanyId: "${firstMember.company?._id}"`);
        console.log(`  roleId: "${firstMember.role}"`);
      }
    }
    
    // Test 4: Check for issues
    console.log('\n=== TEST 4: Potential Issues ===');
    
    // Users with empty memberfor
    const emptyMemberFor = await User.countDocuments({
      $or: [
        { memberfor: { $exists: false } },
        { memberfor: { $size: 0 } },
        { memberfor: null }
      ],
      isSuperAdmin: { $ne: true }
    });
    
    console.log(`Users with empty memberfor: ${emptyMemberFor}`);
    
    // Users with invalid role IDs in memberfor
    const usersWithInvalidRoles = await User.find({
      memberfor: { $exists: true, $ne: [] },
      isSuperAdmin: { $ne: true }
    }).populate('roleId', 'subRoles');
    
    let invalidRoleCount = 0;
    usersWithInvalidRoles.forEach(user => {
      if (user.memberfor && user.roleId && user.roleId.subRoles) {
        user.memberfor.forEach(member => {
          const hasValidRole = user.roleId.subRoles.some(sr => sr.id === member.role);
          if (!hasValidRole && !['Administrator', 'User', 'ADMIN'].includes(member.role)) {
            invalidRoleCount++;
          }
        });
      }
    });
    
    console.log(`Users with potentially invalid role IDs: ${invalidRoleCount}`);
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run if called directly
if (require.main === module) {
  testMemberForStructure();
}

module.exports = testMemberForStructure;