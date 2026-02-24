const express = require('express');
const router = express.Router();
const videoData = require('../video.json');

router.get('/videos', (req, res) => {
  res.json(videoData);
});

module.exports = router;
