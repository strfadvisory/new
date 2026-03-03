const express = require('express');
const { createRole, getAllRoles, getRoleById, updateRole, deleteRole, getMasterRoles, getUserPermissions, getUserNextSteps, getUserVideos, updateUserNextStep, updateUserOwnRole, simpleUpdateRole } = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware.jsx');

const router = express.Router();

// Public route for signup
router.get('/company-types', getMasterRoles);

// User permissions route
router.get('/user-permissions', protect, getUserPermissions);

// User dashboard routes
router.get('/user-nextsteps', protect, getUserNextSteps);
router.get('/user-videos', protect, getUserVideos);
router.put('/user-nextstep', protect, updateUserNextStep);
router.put('/user-own-role', protect, simpleUpdateRole);

// Protected CRUD routes
router.post('/', protect, createRole);
router.get('/', protect, getAllRoles);
router.get('/:id', protect, getRoleById);
router.put('/:id', protect, simpleUpdateRole);
router.delete('/:id', protect, deleteRole);

module.exports = router;