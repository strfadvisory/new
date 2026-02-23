const express = require('express');
const router = express.Router();
const menuData = require('../menubar.json');

router.get('/menu-master', (req, res) => {
  res.json(menuData);
});

module.exports = router;
