const express = require('express');
const { 
  getAllAssociations, 
  getAssociationById, 
  createAssociation, 
  updateAssociation, 
  deleteAssociation 
} = require('../controllers/associationController');
const { protect } = require('../middleware/authMiddleware.jsx');

const router = express.Router();

router.get('/', protect, getAllAssociations);
router.get('/:id', protect, getAssociationById);
router.post('/', protect, createAssociation);
router.put('/:id', protect, updateAssociation);
router.delete('/:id', protect, deleteAssociation);

module.exports = router;