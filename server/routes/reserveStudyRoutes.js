const express = require('express');
const router = express.Router();
const {
  upload,
  createReserveStudy,
  getReserveStudies,
  getReserveStudy,
  getReserveStudyData,
  downloadReserveStudy,
  deleteReserveStudy
} = require('../controllers/reserveStudyController');
const { protect } = require('../middleware/authMiddleware.jsx');

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router.post('/', upload.single('excelFile'), createReserveStudy);
router.get('/', getReserveStudies);
router.get('/:id', getReserveStudy);
router.get('/:id/data', getReserveStudyData);
router.get('/:id/download', downloadReserveStudy);
router.delete('/:id', deleteReserveStudy);

module.exports = router;