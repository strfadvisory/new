const mongoose = require('mongoose');
const Role = require('./models/Role');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');
const { GridFSBucket } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/your-database';

const uploadIconToGridFS = async (iconName, bucket) => {
  const iconPath = path.join(__dirname, 'static', 'icons', `${iconName}.png`);
  
  let iconBuffer;
  try {
    // Try to read actual icon file
    iconBuffer = fs.readFileSync(iconPath);
    console.log(`📁 Found icon file: ${iconName}.png (${iconBuffer.length} bytes)`);
  } catch (error) {
    console.log(`⚠️  Icon file not found: ${iconName}.png, creating placeholder`);
    // If file doesn't exist, create a simple colored placeholder
    const colors = {
      management_company: 'FF6B6B',
      bank_office: '4ECDC4', 
      reserve_study_company: '45B7D1',
      investor_advisor: '96CEB4',
      board_members: 'FFEAA7',
      other: 'DDA0DD'
    };
    
    const color = colors[iconName] || 'CCCCCC';
    const svgIcon = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#${color}"/><text x="32" y="36" text-anchor="middle" fill="white" font-size="12" font-family="Arial">${iconName.charAt(0).toUpperCase()}</text></svg>`;
    iconBuffer = Buffer.from(svgIcon);
  }
  
  const uploadStream = bucket.openUploadStream(`${iconName}.png`, {
    metadata: { type: 'role-icon', iconName }
  });
  
  return new Promise((resolve, reject) => {
    uploadStream.end(iconBuffer);
    uploadStream.on('finish', () => {
      console.log(`✅ Uploaded icon: ${iconName} (ID: ${uploadStream.id})`);
      resolve(uploadStream.id);
    });
    uploadStream.on('error', (err) => {
      console.error(`❌ Error uploading ${iconName}:`, err);
      reject(err);
    });
  });
};

const seedDefaultRoles = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB for role seeding');
    }

    const superAdmin = await User.findOne({ email: 'admin@reservefundadvisory.com' });
    if (!superAdmin) {
      throw new Error('Super admin not found. Please run seedSuperAdmin first.');
    }

    const companyTypesPath = path.join(__dirname, 'static', 'icons', 'company-types.json');
    const companyTypes = JSON.parse(fs.readFileSync(companyTypesPath, 'utf8'));

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'icons' });

    // Clear existing icons bucket
    const iconsCursor = bucket.find({ 'metadata.type': 'role-icon' });
    for await (const file of iconsCursor) {
      await bucket.delete(file._id);
    }

    await Role.deleteMany({ type: 'Master' });
    
    const masterRoles = [];
    for (const companyType of companyTypes) {
      const iconId = await uploadIconToGridFS(companyType.id, bucket);
      // Add small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 100));
      
      masterRoles.push({
        name: companyType.name,
        description: companyType.description,
        icon: `/api/icons/${iconId}`,
        type: 'Master',
        status: true,
        permissions: [],
        nextSteps: [],
        videos: [],
        createdBy: superAdmin._id
      });
    }

    await Role.insertMany(masterRoles);

    console.log(`Successfully seeded ${masterRoles.length} default master roles with GridFS icons`);
    console.log('Master roles created:', masterRoles.map(role => role.name).join(', '));

  } catch (error) {
    console.error('Error seeding default roles:', error);
    throw error;
  }
};

if (require.main === module) {
  seedDefaultRoles().finally(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}

module.exports = seedDefaultRoles;