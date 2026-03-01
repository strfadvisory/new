const mongoose = require('mongoose');
const Library = require('../models/Library');
const videoData = require('../video.json');
require('dotenv').config();

const seedLibraryItems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing library items
    await Library.deleteMany({});
    console.log('Cleared existing library items');

    // Transform video.json data to match Library schema
    const libraryItems = videoData.map(video => ({
      title: video.title,
      description: video.description,
      thumbnail: video.image,
      videoUrl: video.videoUrl,
      isActive: video.isActive
    }));

    // Insert library items
    const result = await Library.insertMany(libraryItems);
    console.log(`Inserted ${result.length} library items`);

    console.log('Library seeding completed successfully');
  } catch (error) {
    console.error('Library seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run seeding
if (require.main === module) {
  seedLibraryItems();
}

module.exports = seedLibraryItems;