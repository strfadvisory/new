const express = require("express");
const router = express.Router();
const masterDataService = require("../services/masterDataService");
const Library = require("../models/Library");
const { protect } = require("../middleware/authMiddleware.jsx");

router.get("/api/master", protect, async (req, res) => {
  try {
    const masterData = masterDataService.masterData;
    const libraryVideos = await Library.find({ isActive: true });

    if (req.user.isSuperAdmin) {
      res.json({
        ...masterData,
        videos: libraryVideos
      });
    } else {
      const userPermissions = req.user.roleId?.permissions || [];
      const userNextSteps = req.user.roleId?.nextSteps || [];
      const userVideos = req.user.roleId?.videos || [];

      // Filter permissions - only include modules that have at least one user permission
      const filteredPermissions = masterData.permissions.map(module => ({
        ...module,
        permissions: module.permissions.filter(perm => userPermissions.includes(perm.id))
      })).filter(module => module.permissions.length > 0);

      // Filter nextSteps
      const filteredNextSteps = masterData.nextSteps.filter(step => userNextSteps.includes(step.id));

      // Filter videos from library based on user permissions
      const filteredVideos = libraryVideos.filter(video => 
        userVideos.includes(video._id.toString())
      );

      res.json({
        ...masterData,
        permissions: filteredPermissions,
        nextSteps: filteredNextSteps,
        videos: filteredVideos
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error loading master data" });
  }
});

module.exports = router;
