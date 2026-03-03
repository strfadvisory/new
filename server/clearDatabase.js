const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/your-database';

async function clearDatabase() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    }

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    console.log('Clearing all collections...');
    
    // Clear each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      await db.collection(collectionName).deleteMany({});
      console.log(`Cleared collection: ${collectionName}`);
    }
    
    console.log('Database cleared successfully');
    
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  clearDatabase().finally(() => mongoose.disconnect());
}

module.exports = clearDatabase;