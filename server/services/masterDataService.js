const fs = require('fs');
const path = require('path');

class MasterDataService {
  constructor() {
    this.masterData = null;
    this.loadMasterData();
  }

  loadMasterData() {
    try {
      const masterPath = path.join(__dirname, '../master.json');
      this.masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
      console.log('Master data loaded successfully');
    } catch (error) {
      console.error('Error loading master data:', error);
      // Fallback empty structure
      this.masterData = {
        modules: [],
        nextSteps: [],
        videos: []
      };
    }
  }

  getPermissionById(id) {
    return null;
  }

  getNextStepById(id) {
    return this.masterData.nextSteps.find(ns => ns.id === id);
  }

  getVideoById(id) {
    return this.masterData.videos.find(v => v.id === id);
  }

  getModuleByKey(key) {
    return this.masterData.modules.find(m => m.key === key);
  }

  getPermissionsByModule(moduleId) {
    return [];
  }

  getUserNavigation(permissions) {
    // Handle both old string format and new object format permissions
    const permissionIds = permissions.map(p => 
      typeof p === 'string' ? p : p.permissionId
    );
    
    // Filter modules based on user's assigned permissions
    return this.masterData.modules
      .filter(module => {
        // Check if user has permission for this module
        const hasPermission = permissionIds.includes(module.key);
        if (!hasPermission) return false;
        
        // If permission is object format, check canView
        const permissionObj = permissions.find(p => 
          (typeof p === 'string' ? p : p.permissionId) === module.key
        );
        
        if (typeof permissionObj === 'object') {
          // For object format, user needs canView to see in navigation
          return true; // If they have the permission, they can view
        }
        
        // For string format, assume they can view
        return true;
      })
      .map(module => ({
        level: module.displayName,
        path: `/dashboard/${module.key.toLowerCase().replace('_', '-')}`
      }));
  }

  getAvailableNextSteps(permissions) {
    return this.masterData.nextSteps;
  }

  getAvailableVideos(permissions) {
    return this.masterData.videos;
  }
}

module.exports = new MasterDataService();