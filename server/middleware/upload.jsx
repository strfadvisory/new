const multer = require('multer');
const mongoose = require('mongoose');
const { Readable } = require('stream');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
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
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'reserve-studies' });
    const readableStream = Readable.from(req.file.buffer);
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: {
        uploadedBy: req.user?.id,
        uploadedAt: new Date()
      }
    });
    
    readableStream.pipe(uploadStream);
    
    uploadStream.on('finish', () => {
      req.file.gridfsId = uploadStream.id;
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
