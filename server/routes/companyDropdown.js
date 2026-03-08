const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware.jsx');

// GET /api/company-dropdown - Get companies for dropdown
router.get('/', protect, async (req, res) => {
  try {
    const companies = await User.aggregate([
      {
        $match: {
          role: "ADMIN",
          'companyProfile.companyName': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$orgId",
          companyName: { $first: "$companyProfile.companyName" }
        }
      },
      {
        $project: {
          _id: 1,
          companyName: 1
        }
      }
    ]);
    
    res.json({ companies });
  } catch (error) {
    console.error('Error fetching companies for dropdown:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;