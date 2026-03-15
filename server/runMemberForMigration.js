const fixEmptyMemberFor = require('./migrations/fixEmptyMemberFor');

const runMigration = async () => {
  try {
    console.log('Starting memberfor migration...');
    const result = await fixEmptyMemberFor();
    console.log('Migration completed successfully:', result);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();