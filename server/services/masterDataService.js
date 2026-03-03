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
        permissions: [],
        nextSteps: [],
        videos: []
      };
    }
  }

  getPermissionById(id) {
    for (const module of this.masterData.permissions) {
      const permission = module.permissions.find(p => p.id === id);
      if (permission) return { ...permission, module: module.key };
    }
    return null;
  }

  getNextStepById(id) {
    return this.masterData.nextSteps.find(ns => ns.id === id);
  }

  getVideoById(id) {
    return this.masterData.videos.find(v => v.id === id);
  }

  getModuleByKey(key) {
    return this.masterData.permissions.find(m => m.key === key);
  }

  getUserNavigation(permissionIds) {
    const modules = new Map();
    
    permissionIds.forEach(permId => {
      const permission = this.getPermissionById(permId);
      if (permission) {
        if (!modules.has(permission.module)) {
          const module = this.getModuleByKey(permission.module);
          modules.set(permission.module, {
            level: module.displayName,
            path: `/dashboard/${permission.module.toLowerCase().replace('_', '-')}`
          });
        }
      }
    });

    return Array.from(modules.values());
  }

  getAvailableNextSteps(permissionIds) {
    return this.masterData.nextSteps.filter(ns => 
      ns.permissionIds.some(pid => permissionIds.includes(pid))
    );
  }

  getAvailableVideos(permissionIds) {
    return this.masterData.videos.filter(v => 
      v.permissionIds.some(pid => permissionIds.includes(pid))
    );
  }
}

module.exports = new MasterDataService();