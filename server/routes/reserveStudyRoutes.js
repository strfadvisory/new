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
  deleteReserveStudy
} = require('../controllers/reserveStudyController');
const { protect } = require('../middleware/authMiddleware.jsx');

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router.post('/', upload.single('excelFile'), uploadReserveStudyToGridFS, createReserveStudy);
router.post('/list', getReserveStudies);
router.get('/all', getAllReserveStudies); // New route for superadmin
router.get('/:id', getReserveStudy);
router.get('/:id/data', getReserveStudyData);
router.get('/:id/download', downloadReserveStudy);
router.put('/:id', updateReserveStudy);
router.delete('/:id', deleteReserveStudy);

module.exports = router;