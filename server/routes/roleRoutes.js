const express = require('express');
const { createRole, getAllRoles, getRoleById, updateRole, deleteRole, getMasterRoles, getUserPermissions, getUserNextSteps, getUserVideos } = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware.jsx');
const { restrictToUserRole, requirePermission } = require('../middleware/userRoleMiddleware');

const router = express.Router();

// Public route for signup
router.get('/company-types', getMasterRoles);

// User permissions route
router.get('/user-permissions', protect, getUserPermissions);
router.get('/default-permissions', protect, getUserPermissions);

// User dashboard routes
router.get('/user-nextsteps', protect, getUserNextSteps);
router.get('/user-videos', protect, getUserVideos);

// Protected CRUD routes
router.post('/', protect, createRole);
router.get('/', protect, getAllRoles);
router.get('/:id', protect, getRoleById);
router.put('/:id', protect, updateRole);
router.delete('/:id', protect, deleteRole);

module.exports = router;