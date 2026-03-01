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

// All routes require authentication and super admin access
router.use(protect);
router.use(superAdminOnly);

// GET /api/library - Get all library items
router.get('/', getLibraryItems);

// GET /api/library/:id - Get single library item
router.get('/:id', getLibraryItem);

// POST /api/library - Create new library item
router.post('/', createLibraryItem);

// PUT /api/library/:id - Update library item
router.put('/:id', updateLibraryItem);

// DELETE /api/library/:id - Delete library item
router.delete('/:id', deleteLibraryItem);

module.exports = router;