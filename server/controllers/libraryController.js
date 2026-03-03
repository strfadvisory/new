const Library = require('../models/Library');
const { generateYouTubeThumbnail } = require('../utils/thumbnailUtils');

// Get all library items
const getLibraryItems = async (req, res) => {
  try {
    const items = await Library.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching library items', error: error.message });
  }
};

// Get single library item
const getLibraryItem = async (req, res) => {
  try {
    const item = await Library.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Library item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching library item', error: error.message });
  }
};

// Create new library item
const createLibraryItem = async (req, res) => {
  try {
    const { title, description, thumbnail, videoUrl } = req.body;
    
    const autoThumbnail = generateYouTubeThumbnail(videoUrl);
    
    const newItem = new Library({
      title,
      description,
      thumbnail: thumbnail || autoThumbnail,
      videoUrl
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating library item', error: error.message });
  }
};

// Update library item
const updateLibraryItem = async (req, res) => {
  try {
    const { title, description, thumbnail, videoUrl, isActive } = req.body;
    
    const autoThumbnail = generateYouTubeThumbnail(videoUrl);
    
    const updatedItem = await Library.findByIdAndUpdate(
      req.params.id,
      { title, description, thumbnail: thumbnail || autoThumbnail, videoUrl, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Library item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating library item', error: error.message });
  }
};

// Delete library item
const deleteLibraryItem = async (req, res) => {
  try {
    const deletedItem = await Library.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Library item not found' });
    }

    res.json({ message: 'Library item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting library item', error: error.message });
  }
};

module.exports = {
  getLibraryItems,
  getLibraryItem,
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem
};