const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

const testMemberForStructure = async () => {
  try {
    console.log('Testing memberFor structure...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/strf');
    console.log('Connected to MongoDB');
    
    // Find a user with memberfor data
    const user = await User.findOne({ memberfor: { $exists: true, $ne: [] } })
      .populate('memberfor.company', 'companyProfile firstName lastName')
      .populate('roleId', 'name subRoles');
    
    if (!user) {
      console.log('No users found with memberfor data');
      return;
    }
    
    console.log('\\n=== User Information ===');
    console.log('Email:', user.email);
    console.log('Name:', user.firstName, user.lastName);
    console.log('Role:', user.role);
    
    console.log('\\n=== MemberFor Structure ===');
    if (user.memberfor && user.memberfor.length > 0) {\n      user.memberfor.forEach((member, index) => {\n        console.log(`Member ${index + 1}:`);\n        if (member.company) {\n          console.log('  Company ID:', member.company._id);\n          console.log('  Company Name:', member.company.companyProfile?.companyName || `${member.company.firstName} ${member.company.lastName}`);\n          console.log('  Role:', member.role);\n        } else {\n          console.log('  Invalid member structure:', member);\n        }\n      });\n    } else {\n      console.log('No memberfor data found');\n    }\n    \n    console.log('\\n=== ReqOrg Structure ===');\n    if (user.reqorg && user.reqorg.length > 0) {\n      user.reqorg.forEach((req, index) => {\n        console.log(`Request ${index + 1}:`);\n        console.log('  Org ID:', req.orgId);\n        console.log('  Role:', req.role);\n        console.log('  Status:', req.status);\n        console.log('  Requested By:', req.requestedBy);\n      });\n    } else {\n      console.log('No pending requests found');\n    }\n    \n    // Test role structure\n    if (user.roleId) {\n      console.log('\\n=== Role Information ===');\n      console.log('Role Name:', user.roleId.name);\n      if (user.roleId.subRoles && user.roleId.subRoles.length > 0) {\n        console.log('SubRoles:');\n        user.roleId.subRoles.forEach((subRole, index) => {\n          console.log(`  ${index + 1}. ID: ${subRole.id}, Role: ${subRole.role}, Level: ${subRole.permissionLevel}`);\n        });\n      }\n    }\n    \n    console.log('\\n=== Test Completed Successfully ===');\n    \n  } catch (error) {\n    console.error('Test failed:', error);\n  } finally {\n    await mongoose.disconnect();\n  }\n};\n\n// Run test if called directly\nif (require.main === module) {\n  testMemberForStructure();\n}\n\nmodule.exports = testMemberForStructure;