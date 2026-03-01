const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config();

const addNextStepsAndVideoToRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Default next steps
    const defaultNextSteps = [
      { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members and modules.', icon: 'user', completed: false },
      { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members and modules.', icon: 'building', completed: false },
      { title: 'Upload Reserve Study Data', description: 'Set up a new organizational entity to manage members and modules.', icon: 'file', completed: false },
      { title: 'Schedule meeting with Expert', description: 'Set up a new organizational entity to manage members and modules.', icon: 'calendar', completed: false }
    ];

    // Update all roles that don't have nextSteps or video fields
    const result = await Role.updateMany(
      {
        $or: [
          { nextSteps: { $exists: false } },
          { nextSteps: { $size: 0 } },
          { video: { $exists: false } }
        ]
      },
      {
        $set: {
          nextSteps: defaultNextSteps,
          video: []
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} roles with nextSteps and video fields`);

    // Also update child roles within parent roles
    const rolesWithChildren = await Role.find({ 'childRoles.0': { $exists: true } });
    
    for (const role of rolesWithChildren) {
      let hasChanges = false;
      
      for (const childRole of role.childRoles) {
        if (!childRole.nextSteps || childRole.nextSteps.length === 0) {
          childRole.nextSteps = defaultNextSteps;
          hasChanges = true;
        }
        if (!childRole.video) {
          childRole.video = [];
          hasChanges = true;
        }
        
        // Update grandchild roles too
        if (childRole.childRoles && childRole.childRoles.length > 0) {
          for (const grandChildRole of childRole.childRoles) {
            if (!grandChildRole.nextSteps || grandChildRole.nextSteps.length === 0) {
              grandChildRole.nextSteps = defaultNextSteps;
              hasChanges = true;
            }
            if (!grandChildRole.video) {
              grandChildRole.video = [];
              hasChanges = true;
            }
          }
        }
      }
      
      if (hasChanges) {
        role.markModified('childRoles');
        await role.save();
        console.log(`Updated child roles for: ${role.name}`);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run migration
if (require.main === module) {
  addNextStepsAndVideoToRoles();
}

module.exports = addNextStepsAndVideoToRoles;