const express = require('express');
const { createRole, getAllRoles, getRoleById, updateRole, deleteRole, getDefaultPermissions, getFirstLevelRoles, getUserPermissions, getUserNextSteps, getUserVideos, getChildRoles, getUserOwnRole, updateUserOwnRole, bulkUpdatePermissions, getRoleHierarchy, updateUserNextStep, getType2Roles, getType3Roles } = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware.jsx');
const { superAdminOnly } = require('../middleware/superAdminMiddleware');
const { roleManagementPermission } = require('../middleware/roleManagementMiddleware');

const router = express.Router();

router.get('/company-types', getFirstLevelRoles);
router.get('/type-2-roles', protect, getType2Roles);
router.get('/type-3-roles/:parentId', protect, getType3Roles);
router.get('/user-permissions', protect, getUserPermissions);
router.get('/user-nextsteps', protect, getUserNextSteps);
router.put('/user-nextstep', protect, updateUserNextStep);
router.get('/user-videos', protect, getUserVideos);
router.get('/user-own-role', protect, getUserOwnRole);
router.put('/user-own-role', protect, updateUserOwnRole);
router.get('/child-roles', protect, getChildRoles);
router.put('/bulk-permissions', protect, roleManagementPermission, bulkUpdatePermissions);
router.get('/:id/hierarchy', protect, roleManagementPermission, getRoleHierarchy);
router.post('/', protect, roleManagementPermission, createRole);
router.get('/', protect, roleManagementPermission, getAllRoles);
router.get('/default-permissions', protect, roleManagementPermission, getDefaultPermissions);
router.get('/:id', protect, roleManagementPermission, getRoleById);
router.put('/:id', protect, roleManagementPermission, updateRole);
router.delete('/:id', protect, roleManagementPermission, deleteRole);

module.exports = router;
