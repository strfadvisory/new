const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

const testCompanySwitching = async () => {
  try {
    console.log('Testing company switching functionality...\n');
    
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/your-database';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Find a user with multiple memberfor entries
    const testUser = await User.findOne({
      memberfor: { $exists: true, $size: { $gte: 2 } },
      isSuperAdmin: { $ne: true }
    })
    .populate('roleId', 'name subRoles')
    .populate({
      path: 'memberfor.company',
      select: 'companyProfile firstName lastName _id'
    });
    
    if (!testUser) {
      console.log('No user found with multiple company memberships for testing');
      return;
    }
    
    console.log(`Testing with user: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`);
    console.log(`Current memberfor array (${testUser.memberfor.length} entries):`);
    
    testUser.memberfor.forEach((member, index) => {
      const companyName = member.company?.companyProfile?.companyName || 
                         `${member.company?.firstName} ${member.company?.lastName}` || 
                         'Unknown Company';
      
      let roleName = member.role;
      if (testUser.roleId && testUser.roleId.subRoles && member.role) {
        const subRole = testUser.roleId.subRoles.find(sr => sr.id === member.role);
        if (subRole) {
          roleName = `${subRole.role} (${member.role})`;
        }
      }
      
      console.log(`  [${index}] ${companyName} - Role: ${roleName}`);\n    });\n    \n    // Test getUserMemberInfo logic\n    console.log('\\n=== Current Header Display (memberfor[0]) ===');\n    if (testUser.memberfor && testUser.memberfor.length > 0) {\n      const firstMember = testUser.memberfor[0];\n      const companyName = firstMember.company?.companyProfile?.companyName || \n                         `${firstMember.company?.firstName} ${firstMember.company?.lastName}` || \n                         'Unknown Company';\n      \n      let userRole = firstMember.role;\n      if (testUser.roleId && testUser.roleId.subRoles && firstMember.role) {\n        const subRole = testUser.roleId.subRoles.find(sr => sr.id === firstMember.role);\n        if (subRole) {\n          userRole = subRole.role;\n        }\n      }\n      \n      console.log(`Company Name: \"${companyName}\"`);\n      console.log(`User Role: \"${userRole}\"`);\n      console.log(`Company ID: ${firstMember.company?._id}`);\n      console.log(`Role ID: ${firstMember.role}`);\n    }\n    \n    // Simulate company switching\n    if (testUser.memberfor.length >= 2) {\n      console.log('\\n=== Simulating Company Switch ===');\n      const secondCompany = testUser.memberfor[1];\n      const targetCompanyId = secondCompany.company._id;\n      \n      console.log(`Switching to: ${secondCompany.company?.companyProfile?.companyName || \n                                   `${secondCompany.company?.firstName} ${secondCompany.company?.lastName}`}`);\n      \n      // Simulate the switchCompany logic\n      const selectedMemberEntry = testUser.memberfor.find(member => \n        member.company && member.company._id.toString() === targetCompanyId.toString()\n      );\n      \n      if (selectedMemberEntry) {\n        // Remove from current position\n        testUser.memberfor = testUser.memberfor.filter(member => \n          !(member.company && member.company._id.toString() === targetCompanyId.toString())\n        );\n        \n        // Add to beginning\n        testUser.memberfor.unshift(selectedMemberEntry);\n        \n        console.log('\\nAfter switch - New memberfor order:');\n        testUser.memberfor.forEach((member, index) => {\n          const companyName = member.company?.companyProfile?.companyName || \n                             `${member.company?.firstName} ${member.company?.lastName}` || \n                             'Unknown Company';\n          console.log(`  [${index}] ${companyName} - Role: ${member.role}`);\n        });\n        \n        // Show new header display\n        console.log('\\n=== New Header Display (after switch) ===');\n        const newFirstMember = testUser.memberfor[0];\n        const newCompanyName = newFirstMember.company?.companyProfile?.companyName || \n                              `${newFirstMember.company?.firstName} ${newFirstMember.company?.lastName}` || \n                              'Unknown Company';\n        \n        let newUserRole = newFirstMember.role;\n        if (testUser.roleId && testUser.roleId.subRoles && newFirstMember.role) {\n          const subRole = testUser.roleId.subRoles.find(sr => sr.id === newFirstMember.role);\n          if (subRole) {\n            newUserRole = subRole.role;\n          }\n        }\n        \n        console.log(`Company Name: \"${newCompanyName}\"`);\n        console.log(`User Role: \"${newUserRole}\"`);\n        console.log(`Company ID: ${newFirstMember.company?._id}`);\n        console.log(`Role ID: ${newFirstMember.role}`);\n        \n        // Note: We're not actually saving to database in this test\n        console.log('\\n(Note: Changes not saved to database - this is just a simulation)');\n      }\n    }\n    \n    console.log('\\n=== Test Complete ===');\n    \n  } catch (error) {\n    console.error('Test failed:', error);\n  } finally {\n    await mongoose.disconnect();\n  }\n};\n\n// Run if called directly\nif (require.main === module) {\n  testCompanySwitching();\n}\n\nmodule.exports = testCompanySwitching;