const fixMemberForStructure = require('./migrations/fixMemberForStructure');

const runMigration = async () => {
  try {
    console.log('Running memberFor structure migration...');
    await fixMemberForStructure();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();