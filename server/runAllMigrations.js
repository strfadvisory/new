require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const runAllMigrations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for migrations');

    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      try {
        console.log(`Running migration: ${file}`);
        const migration = require(path.join(migrationsDir, file));
        
        if (typeof migration === 'function') {
          await migration();
        } else if (migration.up && typeof migration.up === 'function') {
          await migration.up();
        }
        
        console.log(`✅ Migration ${file} completed successfully`);
      } catch (error) {
        console.error(`❌ Migration ${file} failed:`, error.message);
        // Continue with other migrations
      }
    }

    console.log('All migrations completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration runner error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runAllMigrations();
}

module.exports = runAllMigrations;