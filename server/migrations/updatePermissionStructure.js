const mongoose = require('mongoose');
const Role = require('../models/Role');

const updatePermissionStructure = async () => {
  try {
    console.log('Starting permission structure migration...');
    
    // Find all roles with old permission structure (array of strings)
    const roles = await Role.find({});
    
    for (const role of roles) {
      let needsUpdate = false;
      const updatedPermissions = [];
      
      if (role.permissions && Array.isArray(role.permissions)) {
        for (const permission of role.permissions) {
          if (typeof permission === 'string') {
            // Old format - convert to new format
            updatedPermissions.push({
              permissionId: permission,
              canEdit: true,
              limit: ''
            });
            needsUpdate = true;
          } else if (permission && typeof permission === 'object') {
            // Already new format or mixed format
            updatedPermissions.push({
              permissionId: permission.permissionId || permission.id || permission,
              canEdit: permission.canEdit !== undefined ? permission.canEdit : true,
              limit: permission.limit || ''
            });
          }
        }
      }
      
      if (needsUpdate) {
        await Role.findByIdAndUpdate(role._id, {
          permissions: updatedPermissions
        });
        console.log(`Updated role: ${role.name}`);
      }
    }
    
    console.log('Permission structure migration completed successfully!');
  } catch (error) {
    console.error('Error during permission structure migration:', error);
    throw error;
  }
};

module.exports = updatePermissionStructure;

// Run migration if called directly
if (require.main === module) {
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/strf');
      console.log('MongoDB connected for migration');
      
      await updatePermissionStructure();
      
      await mongoose.connection.close();
      console.log('Migration completed and connection closed');
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  };
  
  connectDB();
}