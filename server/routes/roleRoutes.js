const express = require('express');
const { createRole, getAllRoles, getRoleById, updateRole, deleteRole, getDefaultPermissions, getFirstLevelRoles, getUserPermissions } = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware.jsx');
const { superAdminOnly } = require('../middleware/superAdminMiddleware');

const router = express.Router();

router.get('/company-types', getFirstLevelRoles);
router.get('/user-permissions', protect, getUserPermissions);
router.post('/', protect, superAdminOnly, createRole);
router.get('/', protect, superAdminOnly, getAllRoles);
router.get('/default-permissions', protect, superAdminOnly, getDefaultPermissions);
router.get('/:id', protect, superAdminOnly, getRoleById);
router.put('/:id', protect, superAdminOnly, updateRole);
router.delete('/:id', protect, superAdminOnly, deleteRole);

module.exports = router;
