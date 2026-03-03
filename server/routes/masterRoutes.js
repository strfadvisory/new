const express = require("express");
const router = express.Router();
const masterDataService = require("../services/masterDataService");
const { protect } = require("../middleware/authMiddleware.jsx");

router.get("/api/master", protect, (req, res) => {
  try {
    const masterData = masterDataService.masterData;

    if (req.user.isSuperAdmin) {
      res.json(masterData);
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

      // Filter videos
      const filteredVideos = masterData.videos.filter(video => userVideos.includes(video.id));

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
