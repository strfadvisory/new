const express = require('express');
const router = express.Router();
const masterDataService = require('../services/masterDataService');

router.get('/master.json', (req, res) => {
  try {
    res.json(masterDataService.masterData);
  } catch (error) {
    res.status(500).json({ message: 'Error loading master data' });
  }
});

module.exports = router;