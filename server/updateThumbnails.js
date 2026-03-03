const mongoose = require('mongoose');
const Library = require('./models/Library');
const { generateYouTubeThumbnail } = require('./utils/thumbnailUtils');
require('dotenv').config();

const updateThumbnails = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database');
    console.log('Connected to MongoDB');

    const items = await Library.find({});
    console.log(`Found ${items.length} library items`);

    for (const item of items) {
      const newThumbnail = generateYouTubeThumbnail(item.videoUrl);
      
      if (newThumbnail && newThumbnail !== item.thumbnail) {
        await Library.findByIdAndUpdate(item._id, { 
          thumbnail: newThumbnail,
          updatedAt: new Date()
        });
        console.log(`Updated thumbnail for: ${item.title}`);
      }
    }

    console.log('Thumbnail update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating thumbnails:', error);
    process.exit(1);
  }
};

updateThumbnails();