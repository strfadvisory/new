const express = require('express');
const { getAllUsers, updateUserStatus, getUserById, updateUser, getAdminUsers, getCompanies, createCompanyProfile, deleteAccount, getUserCompanies, getPendingRequests, handleOrgRequest, switchCompany, getUserPermissionLevel, getUserMemberInfo, addMemberWithRoleValidation } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware.jsx');
const { superAdminOnly } = require('../middleware/superAdminMiddleware');

const router = express.Router();

router.get('/', protect, superAdminOnly, getAllUsers);
router.get('/admins', protect, superAdminOnly, getAdminUsers);
router.get('/companies', protect, superAdminOnly, getCompanies);
router.get('/user-companies', protect, getUserCompanies);
router.get('/pending-requests', protect, getPendingRequests);
router.get('/permission-level/:companyId', protect, getUserPermissionLevel);
router.get('/member-info', protect, getUserMemberInfo);
router.get('/:id', protect, superAdminOnly, getUserById);
router.put('/:id', protect, superAdminOnly, updateUser);
router.put('/:id/status', protect, superAdminOnly, updateUserStatus);
router.put('/org-request/:requestId', protect, handleOrgRequest);
router.post('/create-company-profile', protect, createCompanyProfile);
router.post('/switch-company', protect, switchCompany);
router.post('/invite-member', protect, addMemberWithRoleValidation);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;