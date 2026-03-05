const express = require('express');
const { getAllUsers, updateUserStatus, getUserById, updateUser, getAdminUsers, getCompanies } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware.jsx');
const { superAdminOnly } = require('../middleware/superAdminMiddleware');

const router = express.Router();

router.get('/', protect, superAdminOnly, getAllUsers);
router.get('/admins', protect, superAdminOnly, getAdminUsers);
router.get('/companies', protect, superAdminOnly, getCompanies);
router.get('/:id', protect, superAdminOnly, getUserById);
router.put('/:id', protect, superAdminOnly, updateUser);
router.put('/:id/status', protect, superAdminOnly, updateUserStatus);

module.exports = router;