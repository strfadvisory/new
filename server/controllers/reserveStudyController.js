const ReserveStudy = require('../models/ReserveStudy');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { upload, uploadReserveStudyToGridFS } = require('../middleware/upload.jsx');
const path = require('path');
const fs = require('fs');

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
      uploadedBy: req.user._id,
      createdBy: req.user._id,
      allowUser: [req.user._id],
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

// Get all reserve studies for superadmin
const getAllReserveStudies = async (req, res) => {
  try {
    // Only allow superadmin to access this endpoint
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({
        message: 'Access denied. Superadmin privileges required.',
        data: []
      });
    }

    const studies = await ReserveStudy.find({ status: 'active' })
      .populate('uploadedBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('allowUser', 'firstName lastName email')
      .populate('associationId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      message: 'All reserve studies retrieved successfully',
      data: studies
    });
  } catch (error) {
    console.error('Error fetching all reserve studies:', error);
    res.status(500).json({ message: 'Failed to fetch reserve studies' });
  }
};

// Get all reserve studies
const getReserveStudies = async (req, res) => {
  try {
    const { associationId } = req.body;
    
    let filter = { status: 'active' };
    
    // If user is superadmin, show all reserve studies
    if (!req.user.isSuperAdmin) {
      filter.allowUser = { $in: [req.user._id] };
      
      // Make associationId required for non-superadmin users
      if (!associationId) {
        return res.status(400).json({
          message: 'Association ID is required',
          data: []
        });
      }
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(associationId)) {
        return res.status(400).json({
          message: 'Invalid association ID format',
          data: []
        });
      }
      
      filter.associationId = new mongoose.Types.ObjectId(associationId);
    } else {
      // For superadmin, if associationId is provided, filter by it
      if (associationId && mongoose.Types.ObjectId.isValid(associationId)) {
        filter.associationId = new mongoose.Types.ObjectId(associationId);
      }
    }

    const studies = await ReserveStudy.find(filter)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('allowUser', 'firstName lastName email')
      .populate('associationId', 'name')
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
      .populate('uploadedBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('allowUser', 'firstName lastName email');

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
// Professional Excel Parser with Comprehensive Error Handling
function parseReserveStudyFromBuffer(buffer) {
  try {
    console.log('[parseReserveStudyFromBuffer] Starting Excel parsing...');
    
    // Validate buffer
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty or invalid Excel file buffer');
    }
    
    console.log(`[parseReserveStudyFromBuffer] Buffer size: ${buffer.length} bytes`);
    
    // Parse workbook with error handling
    let workbook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true, cellNF: false, cellText: false });
    } catch (xlsxError) {
      console.error('[parseReserveStudyFromBuffer] XLSX parsing error:', xlsxError);
      throw new Error(`Invalid Excel file format: ${xlsxError.message}`);
    }
    
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Excel file contains no sheets');
    }
    
    console.log(`[parseReserveStudyFromBuffer] Available sheets: ${workbook.SheetNames.join(', ')}`);
    
    // Smart sheet detection with multiple fallback strategies
    let sheet = null;
    let sheetName = null;
    
    // Strategy 1: Look for exact "Manual entry" match
    if (workbook.Sheets["Manual entry"]) {
      sheet = workbook.Sheets["Manual entry"];
      sheetName = "Manual entry";
      console.log('[parseReserveStudyFromBuffer] Found exact "Manual entry" sheet');
    }
    
    // Strategy 2: Case-insensitive search for manual entry variations
    if (!sheet) {
      const manualEntryVariations = [
        "Manual Entry", "manual entry", "MANUAL ENTRY", "Manual_Entry", 
        "Manual-Entry", "ManualEntry", "Manual", "Entry"
      ];
      
      for (const variation of manualEntryVariations) {
        if (workbook.Sheets[variation]) {
          sheet = workbook.Sheets[variation];
          sheetName = variation;
          console.log(`[parseReserveStudyFromBuffer] Found sheet variation: ${variation}`);
          break;
        }
      }
    }
    
    // Strategy 3: Look for sheets containing "manual" or "entry" (case-insensitive)
    if (!sheet) {
      for (const name of workbook.SheetNames) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('manual') || lowerName.includes('entry') || lowerName.includes('data')) {
          sheet = workbook.Sheets[name];
          sheetName = name;
          console.log(`[parseReserveStudyFromBuffer] Found sheet containing keywords: ${name}`);
          break;
        }
      }
    }
    
    // Strategy 4: Use first sheet as last resort
    if (!sheet) {
      const firstSheetName = workbook.SheetNames[0];
      sheet = workbook.Sheets[firstSheetName];
      sheetName = firstSheetName;
      console.log(`[parseReserveStudyFromBuffer] Using first available sheet: ${firstSheetName}`);
    }
    
    if (!sheet) {
      throw new Error('No accessible sheets found in Excel file');
    }
    
    // Convert sheet to JSON with error handling
    let data;
    try {
      data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });
    } catch (conversionError) {
      console.error('[parseReserveStudyFromBuffer] Sheet conversion error:', conversionError);
      throw new Error(`Failed to convert sheet to data: ${conversionError.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Sheet "${sheetName}" is empty or contains no readable data`);
    }
    
    console.log(`[parseReserveStudyFromBuffer] Sheet data rows: ${data.length}`);
    
    // Parse configuration with enhanced error handling
    const config = {};
    try {
      const configRows = data.slice(0, Math.min(15, data.length)); // Look at first 15 rows max
      configRows.forEach((row, index) => {
        if (row && row[0] && typeof row[0] === 'string' && 
            row[0] !== 'PLEASE FILL OUT TEMPLATE AS IS, DO NOT MOVE TABLES OR ITEMS' &&
            !row[0].toLowerCase().includes('item') &&
            !row[0].toLowerCase().includes('name') &&
            !row[0].toLowerCase().includes('component')) {
          const key = row[0].toString().trim();
          const value = row[1] !== undefined ? row[1] : 0;
          if (key) {
            config[key] = value;
          }
        }
      });
      console.log(`[parseReserveStudyFromBuffer] Parsed config keys: ${Object.keys(config).join(', ')}`);
    } catch (configError) {
      console.warn('[parseReserveStudyFromBuffer] Config parsing warning:', configError.message);
      // Continue with empty config
    }
    
    // Smart header detection with multiple strategies
    let headerIndex = -1;
    
    // Strategy 1: Look for exact "Item Name"
    headerIndex = data.findIndex(row => row && row[0] === "Item Name");
    
    // Strategy 2: Look for variations of item headers
    if (headerIndex === -1) {
      const headerVariations = [
        "Item", "Name", "Component", "Component Name", "Item Description",
        "Description", "Asset", "Asset Name", "Reserve Item", "Reserve Component"
      ];
      
      for (const header of headerVariations) {
        headerIndex = data.findIndex(row => 
          row && row[0] && row[0].toString().toLowerCase().includes(header.toLowerCase())
        );
        if (headerIndex !== -1) {
          console.log(`[parseReserveStudyFromBuffer] Found header variation at row ${headerIndex + 1}: ${data[headerIndex][0]}`);
          break;
        }
      }
    }
    
    // Strategy 3: Look for any row that looks like a table header
    if (headerIndex === -1) {
      headerIndex = data.findIndex((row, index) => {
        if (!row || !row[0]) return false;
        const nextRow = data[index + 1];
        const nextNextRow = data[index + 2];
        // Check if this looks like a header (has text in first column and next rows have data)
        return row[0] && typeof row[0] === 'string' && 
               nextRow && nextRow[0] && 
               nextNextRow && nextNextRow[0];
      });
      
      if (headerIndex !== -1) {
        console.log(`[parseReserveStudyFromBuffer] Found potential header at row ${headerIndex + 1}: ${data[headerIndex][0]}`);
      }
    }
    
    // Strategy 4: Default to a reasonable starting point
    if (headerIndex === -1) {
      headerIndex = Math.min(10, Math.max(0, data.length - 5)); // Start near row 10 or 5 rows from end
      console.log(`[parseReserveStudyFromBuffer] Using default header position: row ${headerIndex + 1}`);
    }
    
    // Parse items with robust error handling
    const items = [];

    // Determine the correct start row for item data:
    // - Prefer headerIndex + 1 if the row looks like a valid item row
    // - Otherwise fall back to headerIndex + 2 (legacy behavior for templates with subheaders)
    const candidateRow1 = data[headerIndex + 1];
    const candidateRow2 = data[headerIndex + 2];

    const isValidDataRow = (row) => {
      if (!row || !row[0]) return false;
      const firstCell = row[0].toString().trim().toLowerCase();
      if (!firstCell || firstCell === 'total' || firstCell === 'sum' || firstCell.includes('header') || firstCell.includes('item name')) {
        return false;
      }
      const expectedLife = parseFloat(row[1]);
      const replacementCost = parseFloat(row[3]);
      return Number.isFinite(expectedLife) && expectedLife > 0 && Number.isFinite(replacementCost) && replacementCost > 0;
    };

    let itemsStartRow = headerIndex + 2;
    if (isValidDataRow(candidateRow1)) {
      itemsStartRow = headerIndex + 1;
    } else if (isValidDataRow(candidateRow2)) {
      itemsStartRow = headerIndex + 2;
    }

    try {
      for (let i = itemsStartRow; i < data.length; i++) {
        const row = data[i];
        
        // Skip empty rows
        if (!row || !row[0] || row[0].toString().trim() === '') continue;
        
        // Skip rows that look like headers or totals
        const firstCell = row[0].toString().toLowerCase();
        if (firstCell.includes('total') || firstCell.includes('sum') || 
            firstCell.includes('header') || firstCell.includes('item name')) {
          continue;
        }
        
        // Parse item with safe type conversion
        const item = {
          itemName: row[0] ? row[0].toString().trim() : 'Unknown Item',
          expectedLife: parseFloat(row[1]) || 0,
          remainingLife: parseFloat(row[2]) || 0,
          replacementCost: parseFloat(row[3]) || 0,
          sirsType: row[4] !== undefined ? row[4] : 0
        };
        
        // Only add items with meaningful data
        if (item.itemName && item.itemName !== 'Unknown Item') {
          items.push(item);
        }
      }
    } catch (itemsError) {
      console.error('[parseReserveStudyFromBuffer] Items parsing error:', itemsError);
      // Continue with whatever items we managed to parse
    }
    
    console.log(`[parseReserveStudyFromBuffer] Successfully parsed ${items.length} items from sheet: ${sheetName}`);
    
    // Validate we have some meaningful data
    if (items.length === 0 && Object.keys(config).length === 0) {
      console.warn('[parseReserveStudyFromBuffer] No meaningful data found, but continuing...');
    }
    
    return { 
      config, 
      items, 
      sheetName,
      metadata: {
        totalRows: data.length,
        headerRow: headerIndex + 1,
        itemsFound: items.length,
        configKeys: Object.keys(config).length
      }
    };
    
  } catch (error) {
    console.error('[parseReserveStudyFromBuffer] Critical parsing error:', error);
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
}

// Enhanced Excel Data Retrieval with Professional Error Handling
const getReserveStudyData = async (req, res) => {
  const { id } = req.params;
  
  console.log(`[getReserveStudyData] Starting data retrieval for study ID: ${id}`);
  
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`[getReserveStudyData] Invalid ObjectId format: ${id}`);
      return res.status(400).json({ 
        message: 'Invalid study ID format',
        error: 'The provided ID is not a valid MongoDB ObjectId'
      });
    }
    
    // Find the study
    const study = await ReserveStudy.findById(id);
    if (!study) {
      console.error(`[getReserveStudyData] Study not found: ${id}`);
      return res.status(404).json({ 
        message: 'Reserve study not found',
        error: `No study exists with ID: ${id}`
      });
    }
    
    console.log(`[getReserveStudyData] Found study: ${study.studyName} (${study.fileName})`);
    
    // Validate file exists in GridFS
    if (!study.fileId) {
      console.error(`[getReserveStudyData] No file ID associated with study: ${id}`);
      return res.status(404).json({ 
        message: 'No file associated with this study',
        error: 'Study record exists but no file is linked'
      });
    }
    
    // Initialize GridFS bucket with error handling
    let bucket;
    try {
      bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { 
        bucketName: 'reserve-studies',
        chunkSizeBytes: 1024 * 1024 // 1MB chunks
      });
    } catch (bucketError) {
      console.error('[getReserveStudyData] GridFS bucket initialization error:', bucketError);
      return res.status(500).json({ 
        message: 'Database connection error',
        error: 'Failed to initialize file storage system'
      });
    }
    
    // Check if file exists in GridFS
    try {
      const fileInfo = await bucket.find({ _id: study.fileId }).toArray();
      if (!fileInfo || fileInfo.length === 0) {
        console.error(`[getReserveStudyData] File not found in GridFS: ${study.fileId}`);
        return res.status(404).json({ 
          message: 'Excel file not found in storage',
          error: `File with ID ${study.fileId} does not exist in GridFS`
        });
      }
      console.log(`[getReserveStudyData] File found in GridFS: ${fileInfo[0].filename} (${fileInfo[0].length} bytes)`);
    } catch (findError) {
      console.error('[getReserveStudyData] Error checking file existence:', findError);
      return res.status(500).json({ 
        message: 'Error accessing file storage',
        error: findError.message
      });
    }
    
    // Create download stream with timeout
    const downloadStream = bucket.openDownloadStream(study.fileId);
    const chunks = [];
    let downloadTimeout;
    
    // Set download timeout (30 seconds)
    downloadTimeout = setTimeout(() => {
      console.error('[getReserveStudyData] Download timeout');
      downloadStream.destroy();
      if (!res.headersSent) {
        res.status(408).json({ 
          message: 'File download timeout',
          error: 'File download took too long to complete'
        });
      }
    }, 30000);
    
    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
      console.log(`[getReserveStudyData] Downloaded chunk: ${chunk.length} bytes (total: ${Buffer.concat(chunks).length} bytes)`);
    });
    
    downloadStream.on('end', async () => {
      clearTimeout(downloadTimeout);
      
      try {
        console.log(`[getReserveStudyData] Download completed. Total size: ${Buffer.concat(chunks).length} bytes`);
        
        const buffer = Buffer.concat(chunks);
        
        // Validate buffer
        if (!buffer || buffer.length === 0) {
          console.error('[getReserveStudyData] Empty file buffer');
          return res.status(422).json({ 
            message: 'Empty Excel file',
            error: 'The downloaded file is empty or corrupted'
          });
        }
        
        // Parse Excel data with comprehensive error handling
        let parsedData;
        try {
          parsedData = parseReserveStudyFromBuffer(buffer);
        } catch (parseError) {
          console.error('[getReserveStudyData] Excel parsing error:', parseError);
          
          // Try to provide more specific error information
          let errorDetails = parseError.message;
          if (parseError.message.includes('Unsupported file')) {
            errorDetails = 'The file format is not supported. Please ensure it is a valid Excel file (.xlsx, .xls)';
          } else if (parseError.message.includes('No sheets found')) {
            errorDetails = 'The Excel file contains no readable sheets';
          } else if (parseError.message.includes('Empty or invalid')) {
            errorDetails = 'The Excel file appears to be corrupted or empty';
          }
          
          return res.status(422).json({ 
            message: 'Failed to parse Excel data',
            error: errorDetails,
            fileName: study.fileName,
            fileSize: buffer.length,
            studyName: study.studyName
          });
        }
        
        // Validate parsed data
        if (!parsedData) {
          console.error('[getReserveStudyData] Parser returned null/undefined');
          return res.status(500).json({ 
            message: 'Excel parsing returned no data',
            error: 'The parser completed but returned no usable data'
          });
        }
        
        // Construct response data
        const responseData = {
          studyName: study.studyName,
          fileName: study.fileName,
          data: parsedData,
          metadata: {
            studyId: study._id,
            fileSize: buffer.length,
            uploadedBy: study.uploadedBy,
            createdAt: study.createdAt,
            associationId: study.associationId,
            ...parsedData.metadata
          }
        };
        
        console.log(`[getReserveStudyData] Successfully processed: ${study.studyName} - ${parsedData.items?.length || 0} items, ${Object.keys(parsedData.config || {}).length} config keys`);
        
        res.json({
          message: 'Reserve study data retrieved successfully',
          ...responseData
        });
        
      } catch (processingError) {
        clearTimeout(downloadTimeout);
        console.error('[getReserveStudyData] Data processing error:', processingError);
        
        if (!res.headersSent) {
          res.status(500).json({ 
            message: 'Error processing Excel data',
            error: processingError.message,
            studyName: study.studyName,
            fileName: study.fileName
          });
        }
      }
    });
    
    downloadStream.on('error', (streamError) => {
      clearTimeout(downloadTimeout);
      console.error('[getReserveStudyData] Download stream error:', streamError);
      
      if (!res.headersSent) {
        let errorMessage = 'Error downloading Excel file';
        let statusCode = 500;
        
        if (streamError.message.includes('FileNotFound') || streamError.code === 'ENOENT') {
          errorMessage = 'Excel file not found in storage';
          statusCode = 404;
        } else if (streamError.message.includes('GridFSBucketError')) {
          errorMessage = 'File storage system error';
        }
        
        res.status(statusCode).json({ 
          message: errorMessage,
          error: streamError.message,
          studyId: id,
          fileId: study.fileId
        });
      }
    });
    
  } catch (error) {
    console.error('[getReserveStudyData] Unexpected error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Unexpected error occurred',
        error: error.message,
        studyId: id
      });
    }
  }
};

// Update reserve study
const updateReserveStudy = async (req, res) => {
  try {
    const { id } = req.params;
    const { studyName, associationName, allowUser } = req.body;
    
    const study = await ReserveStudy.findById(id);
    if (!study) {
      return res.status(404).json({ message: 'Reserve study not found' });
    }

    const updateData = {};
    
    if (studyName) {
      updateData.studyName = studyName.trim();
    }
    
    if (associationName) {
      const Association = require('../models/Association');
      const association = await Association.findOne({ name: associationName });
      updateData.associationId = association ? association._id : null;
    }
    
    if (allowUser && Array.isArray(allowUser)) {
      updateData.allowUser = allowUser;
    }

    const updatedStudy = await ReserveStudy.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('uploadedBy', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('allowUser', 'firstName lastName email');

    res.json({
      message: 'Reserve study updated successfully',
      data: updatedStudy
    });
  } catch (error) {
    console.error('Error updating reserve study:', error);
    res.status(500).json({ message: 'Failed to update reserve study' });
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

// Generate Excel Template for Reserve Study
const generateTemplate = async (req, res) => {
  try {
    console.log('[generateTemplate] Generating reserve study template...');
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Configuration section data
    const configData = [
      ['PLEASE FILL OUT TEMPLATE AS IS, DO NOT MOVE TABLES OR ITEMS', ''],
      ['', ''],
      ['Beginning Fiscal Year of the Report', new Date().getFullYear()],
      ['Number of Years Covered in the Report', 30],
      ['Beginning Reserve Funds (Dollar Amount)', 0],
      ['Average Monthly Fee per Unit', 0],
      ['Total Number of Housing Units', 0],
      ['Inflation Rate Used in the Report', 0.03],
      ['Suggested Rate of Return on Investments', 0.05],
      ['Safety Net', 0],
      ['Cash Reserve Threshold', 0],
      ['Max Annual Pct Increase', 0.10],
      ['', ''],
      ['', ''],
      ['Item Name', 'Expected Life', 'Remaining Life', 'Replacement Cost', 'SIRS Type (0 or 1)'],
      ['Asphalt Mill and Overlay (Resurface)', 25, 25, 15072, 0],
      ['Balcony, Seal/Repair Conc., Resecure Railing', 15, 15, 5072, 0],
      ['Ceramic and/or Porcelain Tile Flooring', 25, 25, 31040, 0],
      ['Concrete, Flatwork Repairs', 10, 10, 6318, 0],
      ['Cooling Tower, Galvanized, Blow Through', 20, 20, 5000, 0]
    ];
    
    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(configData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 50 },  // Item Name
      { wch: 15 },  // Expected Life
      { wch: 15 },  // Remaining Life
      { wch: 18 },  // Replacement Cost
      { wch: 20 }   // SIRS Type
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Manual entry');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Reserve_Study_Template.xlsx"');
    res.setHeader('Content-Length', buffer.length);
    
    console.log('[generateTemplate] Template generated successfully');
    res.send(buffer);
    
  } catch (error) {
    console.error('[generateTemplate] Error generating template:', error);
    res.status(500).json({ 
      message: 'Failed to generate template',
      error: error.message
    });
  }
};

// Update Reserve Study Data (items and config)
const updateReserveStudyData = async (req, res) => {
  try {
    const { id } = req.params;
    const { studyName, items, config } = req.body;
    
    console.log(`[updateReserveStudyData] Updating study ${id}`);
    console.log(`[updateReserveStudyData] Items count: ${items?.length || 0}`);
    console.log(`[updateReserveStudyData] Config keys: ${Object.keys(config || {}).length}`);
    
    // Validate input
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ 
        message: 'Invalid data format',
        error: 'Items must be an array'
      });
    }
    
    // Find the study
    const study = await ReserveStudy.findById(id);
    if (!study) {
      return res.status(404).json({ message: 'Reserve study not found' });
    }
    
    // Create new Excel file with updated data
    const workbook = XLSX.utils.book_new();
    
    // Prepare data array
    const data = [];
    
    // Add header instruction
    data.push(['PLEASE FILL OUT TEMPLATE AS IS, DO NOT MOVE TABLES OR ITEMS', '']);
    data.push(['', '']);
    
    // Add configuration data
    if (config && typeof config === 'object') {
      Object.entries(config).forEach(([key, value]) => {
        data.push([key, value]);
      });
    }
    
    // Add spacing
    data.push(['', '']);
    data.push(['', '']);
    
    // Add items header
    data.push(['Item Name', 'Expected Life', 'Remaining Life', 'Replacement Cost', 'SIRS Type (0 or 1)']);
    
    // Add items data
    items.forEach(item => {
      data.push([
        item.itemName || item.name || '',
        Number(item.expectedLife) || 0,
        Number(item.remainingLife) || 0,
        Number(item.replacementCost) || 0,
        Number(item.sirsType) || 0
      ]);
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 50 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 }
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Manual entry');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Upload new file to GridFS
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { 
      bucketName: 'reserve-studies' 
    });
    
    // Delete old file
    try {
      await bucket.delete(study.fileId);
      console.log(`[updateReserveStudyData] Deleted old file: ${study.fileId}`);
    } catch (deleteError) {
      console.warn(`[updateReserveStudyData] Could not delete old file: ${deleteError.message}`);
    }
    
    // Upload new file
    const uploadStream = bucket.openUploadStream(study.fileName, {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      metadata: {
        studyId: study._id,
        uploadedBy: req.user._id,
        updatedAt: new Date()
      }
    });
    
    // Write buffer to stream
    uploadStream.end(buffer);
    
    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });
    
    const newFileId = uploadStream.id;
    console.log(`[updateReserveStudyData] Uploaded new file: ${newFileId}`);
    
    // Update study record
    const updateData = {
      fileId: newFileId,
      fileSize: buffer.length,
      updatedAt: new Date()
    };
    
    if (studyName && studyName.trim()) {
      updateData.studyName = studyName.trim();
    }
    
    const updatedStudy = await ReserveStudy.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('uploadedBy', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email');
    
    console.log(`[updateReserveStudyData] Study updated successfully: ${updatedStudy.studyName}`);
    
    res.json({
      message: 'Reserve study updated successfully',
      data: {
        id: updatedStudy._id,
        studyName: updatedStudy.studyName,
        fileName: updatedStudy.fileName,
        fileSize: updatedStudy.fileSize,
        itemsCount: items.length,
        updatedAt: updatedStudy.updatedAt
      }
    });
    
  } catch (error) {
    console.error('[updateReserveStudyData] Error:', error);
    res.status(500).json({ 
      message: 'Failed to update reserve study data',
      error: error.message
    });
  }
};

// Upload additional document to reserve study
const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    
    if (!file || !file.gridfsId) {
      return res.status(400).json({ message: 'File upload failed' });
    }
    
    console.log(`[uploadDocument] Uploading document for study ${id}`);
    console.log(`[uploadDocument] File: ${file.originalname} (${file.size} bytes)`);
    
    // Find the study
    const study = await ReserveStudy.findById(id);
    if (!study) {
      return res.status(404).json({ message: 'Reserve study not found' });
    }
    
    // Initialize documents array if it doesn't exist
    if (!study.documents) {
      study.documents = [];
    }
    
    // Add document reference
    study.documents.push({
      fileName: file.originalname,
      fileId: file.gridfsId,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    });
    
    await study.save();
    
    res.json({
      message: 'Document uploaded successfully',
      data: {
        fileName: file.originalname,
        fileSize: file.size,
        uploadedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('[uploadDocument] Error:', error);
    res.status(500).json({ 
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Get all documents for a reserve study
const getStudyDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    
    const study = await ReserveStudy.findById(id)
      .populate('documents.uploadedBy', 'firstName lastName email');
    
    if (!study) {
      return res.status(404).json({ message: 'Reserve study not found' });
    }
    
    res.json({
      message: 'Documents retrieved successfully',
      data: study.documents || []
    });
    
  } catch (error) {
    console.error('[getStudyDocuments] Error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve documents',
      error: error.message
    });
  }
};

// Download a specific document
const downloadDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    
    const study = await ReserveStudy.findById(id);
    if (!study) {
      return res.status(404).json({ message: 'Reserve study not found' });
    }
    
    const document = study.documents?.find(doc => doc._id.toString() === documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { 
      bucketName: 'reserve-studies' 
    });
    
    const downloadStream = bucket.openDownloadStream(document.fileId);
    
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.fileName}"`
    });
    
    downloadStream.pipe(res);
    
    downloadStream.on('error', (error) => {
      console.error('[downloadDocument] Error:', error);
      if (!res.headersSent) {
        res.status(404).json({ message: 'File not found' });
      }
    });
    
  } catch (error) {
    console.error('[downloadDocument] Error:', error);
    res.status(500).json({ 
      message: 'Failed to download document',
      error: error.message
    });
  }
};

// Duplicate reserve study items
const duplicateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemIndex } = req.body;
    
    console.log(`[duplicateItem] Duplicating item ${itemIndex} in study ${id}`);
    
    // Get current study data
    const study = await ReserveStudy.findById(id);
    if (!study) {
      return res.status(404).json({ message: 'Reserve study not found' });
    }
    
    // Download and parse current file
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { 
      bucketName: 'reserve-studies' 
    });
    
    const downloadStream = bucket.openDownloadStream(study.fileId);
    const chunks = [];
    
    downloadStream.on('data', chunk => chunks.push(chunk));
    
    await new Promise((resolve, reject) => {
      downloadStream.on('end', resolve);
      downloadStream.on('error', reject);
    });
    
    const buffer = Buffer.concat(chunks);
    const parsedData = parseReserveStudyFromBuffer(buffer);
    
    // Duplicate the item
    if (itemIndex >= 0 && itemIndex < parsedData.items.length) {
      const itemToDuplicate = parsedData.items[itemIndex];
      const duplicatedItem = { ...itemToDuplicate };
      parsedData.items.splice(itemIndex + 1, 0, duplicatedItem);
      
      // Update the study with new data
      const updateResult = await updateReserveStudyData(
        { params: { id }, body: { items: parsedData.items, config: parsedData.config }, user: req.user },
        res
      );
      
      // Response is handled by updateReserveStudyData
    } else {
      res.status(400).json({ message: 'Invalid item index' });
    }
    
  } catch (error) {
    console.error('[duplicateItem] Error:', error);
    res.status(500).json({ 
      message: 'Failed to duplicate item',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadReserveStudyToGridFS,
  createReserveStudy,
  getReserveStudies,
  getAllReserveStudies,
  getReserveStudy,
  getReserveStudyData,
  downloadReserveStudy,
  updateReserveStudy,
  deleteReserveStudy,
  generateTemplate,
  updateReserveStudyData,
  uploadDocument,
  getStudyDocuments,
  downloadDocument,
  duplicateItem
};