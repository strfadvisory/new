const multer = require('multer');
const mongoose = require('mongoose');
const { Readable } = require('stream');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow image files only for logo uploads
  if (file.fieldname === 'logo') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for logo upload'), false);
    }
  } else {
    // Allow all file types for other uploads
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const uploadToGridFS = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const readableStream = Readable.from(req.file.buffer);
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: {
        uploadedBy: req.user?.id,
        uploadedAt: new Date()
      }
    });
    
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

module.exports = { upload, uploadToGridFS };
