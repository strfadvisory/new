const express = require('express');
const router = express.Router();

router.get('/videos', (req, res) => {
  res.json([]);
});

module.exports = router;
