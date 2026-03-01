const express = require('express');
const router = express.Router();
const {
  getLibraryItems,
  getLibraryItem,
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem
} = require('../controllers/libraryController');
const { protect } = require('../middleware/authMiddleware.jsx');
const { superAdminOnly } = require('../middleware/superAdminMiddleware');

// Authentication required for all routes
router.use(protect);

// GET /api/library - Get all library items (accessible to all authenticated users)
router.get('/', getLibraryItems);

// GET /api/library/:id - Get single library item (accessible to all authenticated users)
router.get('/:id', getLibraryItem);

// Admin-only routes
router.use(superAdminOnly);

// POST /api/library - Create new library item
router.post('/', createLibraryItem);

// PUT /api/library/:id - Update library item
router.put('/:id', updateLibraryItem);

// DELETE /api/library/:id - Delete library item
router.delete('/:id', deleteLibraryItem);

module.exports = router;