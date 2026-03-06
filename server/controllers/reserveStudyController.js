const ReserveStudy = require('../models/ReserveStudy');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/reserve-studies');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

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

// Create new reserve study
const createReserveStudy = async (req, res) => {
  try {
    const { studyName, associationName } = req.body;
    const file = req.file;

    if (!studyName) {
      return res.status(400).json({ message: 'Study name is required' });
    }

    if (!file) {
      return res.status(400).json({ message: 'Excel file is required' });
    }

    let associationId = null;
    if (associationName) {
      const Association = require('../models/Association');
      const association = await Association.findOne({ name: associationName });
      if (association) {
        associationId = association._id;
      }
    }

    const reserveStudy = new ReserveStudy({
      studyName: studyName.trim(),
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: req.user.id,
      associationId: associationId
    });

    await reserveStudy.save();

    res.status(201).json({
      message: 'Reserve study created successfully',
      data: {
        id: reserveStudy._id,
        studyName: reserveStudy.studyName,
        fileName: reserveStudy.fileName,
        createdAt: reserveStudy.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating reserve study:', error);
    res.status(500).json({ message: 'Failed to create reserve study' });
  }
};

// Get all reserve studies
const getReserveStudies = async (req, res) => {
  try {
    const { association } = req.query;
    let filter = { status: 'active' };
    
    if (association) {
      // Find association by name and filter by its ID
      const Association = require('../models/Association');
      const associationDoc = await Association.findOne({ name: association });
      if (associationDoc) {
        filter.associationId = associationDoc._id;
      } else {
        // If association not found, return empty array
        return res.json({
          message: 'No reserve studies found for this association',
          data: []
        });
      }
    }

    const studies = await ReserveStudy.find(filter)
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Reserve studies retrieved successfully',
      data: studies
    });
  } catch (error) {
    console.error('Error fetching reserve studies:', error);
    res.status(500).json({ message: 'Failed to fetch reserve studies' });
  }
};

// Get single reserve study
const getReserveStudy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const study = await ReserveStudy.findById(id)
      .populate('uploadedBy', 'firstName lastName email');

    if (!study) {
      return res.status(404).json({ message: 'Reserve study not found' });
    }

    res.json({
      message: 'Reserve study retrieved successfully',
      data: study
    });
  } catch (error) {
    console.error('Error fetching reserve study:', error);
    res.status(500).json({ message: 'Failed to fetch reserve study' });
  }
};

// Download reserve study file
const downloadReserveStudy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const study = await ReserveStudy.findById(id);

    if (!study) {
      return res.status(404).json({ message: 'Reserve study not found' });
    }

    if (!fs.existsSync(study.filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(study.filePath, study.fileName);
  } catch (error) {
    console.error('Error downloading reserve study:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
};

// Delete reserve study
const deleteReserveStudy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const study = await ReserveStudy.findById(id);

    if (!study) {
      return res.status(404).json({ message: 'Reserve study not found' });
    }

    // Soft delete
    study.status = 'archived';
    await study.save();

    res.json({ message: 'Reserve study deleted successfully' });
  } catch (error) {
    console.error('Error deleting reserve study:', error);
    res.status(500).json({ message: 'Failed to delete reserve study' });
  }
};

module.exports = {
  upload,
  createReserveStudy,
  getReserveStudies,
  getReserveStudy,
  downloadReserveStudy,
  deleteReserveStudy
};