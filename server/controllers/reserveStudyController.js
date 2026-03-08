const ReserveStudy = require('../models/ReserveStudy');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { upload, uploadToGridFS } = require('../middleware/upload.jsx');

// Create new reserve study
const createReserveStudy = async (req, res) => {
  try {
    const { studyName, associationName } = req.body;
    const file = req.file;

    if (!studyName) {
      return res.status(400).json({ message: 'Study name is required' });
    }

    if (!file || !file.gridfsId) {
      return res.status(400).json({ message: 'Excel file upload failed' });
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
      fileId: file.gridfsId,
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

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'reserve-studies' });
    const downloadStream = bucket.openDownloadStream(study.fileId);

    res.set({
      'Content-Type': study.mimeType,
      'Content-Disposition': `attachment; filename="${study.fileName}"`
    });

    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Download error:', error);
      res.status(404).json({ message: 'File not found' });
    });
  } catch (error) {
    console.error('Error downloading reserve study:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
};

// Parse reserve study Excel file from GridFS
function parseReserveStudyFromBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets["Manual entry"];

  if (!sheet) {
    throw new Error('"Manual entry" sheet not found');
  }

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Parse configuration (first 9 rows)
  const config = {};
  data.slice(0, 9).forEach(row => {
    if (row[0] && row[0] !== 'PLEASE FILL OUT TEMPLATE AS IS, DO NOT MOVE TABLES OR ITEMS') {
      config[row[0]] = row[1] ?? 0;
    }
  });

  // Find table header
  const headerIndex = data.findIndex(row => row[0] === "Item Name");
  if (headerIndex === -1) {
    throw new Error("Item table header not found");
  }

  // Parse items
  const items = [];
  for (let i = headerIndex + 2; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    items.push({
      itemName: row[0],
      expectedLife: Number(row[1]) || 0,
      remainingLife: Number(row[2]) || 0,
      replacementCost: Number(row[3]) || 0,
      sirsType: row[4] || 0
    });
  }

  return { config, items };
}

// Get Excel data as JSON
const getReserveStudyData = async (req, res) => {
  try {
    const { id } = req.params;
    
    const study = await ReserveStudy.findById(id);

    if (!study) {
      return res.status(404).json({ message: 'Reserve study not found' });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'reserve-studies' });
    const downloadStream = bucket.openDownloadStream(study.fileId);
    
    const chunks = [];
    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const parsedData = parseReserveStudyFromBuffer(buffer);
        const jsonData = {
          studyName: study.studyName,
          fileName: study.fileName,
          data: parsedData
        };

        console.log(JSON.stringify(jsonData, null, 2));

        res.json({
          message: 'Reserve study data retrieved successfully',
          ...jsonData
        });
      } catch (parseError) {
        console.error('Error parsing Excel data:', parseError);
        res.status(500).json({ 
          message: 'Failed to parse Excel data',
          error: parseError.message 
        });
      }
    });

    downloadStream.on('error', (error) => {
      console.error('Error reading file from GridFS:', error);
      res.status(404).json({ message: 'Excel file not found' });
    });
  } catch (error) {
    console.error('Error reading Excel data:', error);
    res.status(500).json({ 
      message: 'Failed to read Excel data',
      error: error.message 
    });
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

    // Delete the file from GridFS
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'reserve-studies' });
    await bucket.delete(study.fileId);

    // Delete from database
    await ReserveStudy.findByIdAndDelete(id);

    res.json({ message: 'Reserve study deleted successfully' });
  } catch (error) {
    console.error('Error deleting reserve study:', error);
    res.status(500).json({ message: 'Failed to delete reserve study' });
  }
};

module.exports = {
  upload,
  uploadToGridFS,
  createReserveStudy,
  getReserveStudies,
  getReserveStudy,
  getReserveStudyData,
  downloadReserveStudy,
  deleteReserveStudy
};