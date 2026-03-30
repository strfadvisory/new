const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/reserveStudyController');
const { protect } = require('../middleware/authMiddleware.jsx');

// Apply authentication middleware to all routes
router.use(protect);

// Template generation (no auth required for download)
router.get('/template/download', generateTemplate);

// Reserve Study CRUD
router.post('/', upload.single('excelFile'), uploadReserveStudyToGridFS, createReserveStudy);
router.post('/list', getReserveStudies);
router.get('/all', getAllReserveStudies);
router.get('/:id', getReserveStudy);
router.get('/:id/data', getReserveStudyData);
router.get('/:id/download', downloadReserveStudy);
router.put('/:id', updateReserveStudy);
router.delete('/:id', deleteReserveStudy);

// Data updates
router.put('/:id/data', updateReserveStudyData);

// Document management
router.post('/:id/documents', upload.single('document'), uploadReserveStudyToGridFS, uploadDocument);
router.get('/:id/documents', getStudyDocuments);
router.get('/:id/documents/:documentId/download', downloadDocument);

// Item operations
router.post('/:id/items/duplicate', duplicateItem);

module.exports = router;