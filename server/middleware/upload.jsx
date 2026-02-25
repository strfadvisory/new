const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const { Readable } = require('stream');

const upload = multer({ storage: multer.memoryStorage() });

const uploadToGridFS = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const readableStream = Readable.from(req.file.buffer);
    const uploadStream = bucket.openUploadStream(`${Date.now()}-${req.file.originalname}`);
    
    readableStream.pipe(uploadStream);
    
    uploadStream.on('finish', () => {
      req.file.id = uploadStream.id;
      next();
    });
    
    uploadStream.on('error', (error) => {
      next(error);
    });
  } catch (error) {
    next(error);
  }
};

module.exports = upload;
module.exports.uploadToGridFS = uploadToGridFS;
