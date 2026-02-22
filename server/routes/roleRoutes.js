const express = require('express');
const { createRole, getAllRoles, updateRole, deleteRole } = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware.jsx');
const { superAdminOnly } = require('../middleware/superAdminMiddleware');

const router = express.Router();

router.post('/', protect, superAdminOnly, createRole);
router.get('/', protect, superAdminOnly, getAllRoles);
router.put('/:id', protect, superAdminOnly, updateRole);
router.delete('/:id', protect, superAdminOnly, deleteRole);

module.exports = router;
