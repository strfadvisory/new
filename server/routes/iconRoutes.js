const express = require('express');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'icons' });
    const file = await bucket.find({ _id: new mongoose.Types.ObjectId(req.params.id) }).next();
    
    if (!file) {
      return res.status(404).json({ message: 'Icon not found' });
    }
    
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.id));
    
    downloadStream.on('error', () => {
      res.status(404).json({ message: 'Icon not found' });
    });
    
    // Set content type based on file or default to SVG for placeholders
    const contentType = file.filename?.endsWith('.png') ? 'image/png' : 'image/svg+xml';
    res.set('Content-Type', contentType);
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving icon' });
  }
});

module.exports = router;