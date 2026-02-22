const express = require('express');
const { validateEmail } = require('../controllers/validationController');
const router = express.Router();

router.post('/email', validateEmail);

module.exports = router;