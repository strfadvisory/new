const fs = require('fs');
const path = require('path');

class ConfigService {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('Error loading config:', error);
      return null;
    }
  }

  getRoleByDisplayName(displayName) {
    const roles = this.config?.roles || {};
    return Object.keys(roles).find(key => 
      roles[key].displayName === displayName
    );
  }

  getRoleConfig(roleKey) {
    return this.config?.roles?.[roleKey] || null;
  }

  getRoleByCode(code) {
    const roles = this.config?.roles || {};
    return Object.keys(roles).find(key => 
      roles[key].code === code
    );
  }

  getAllRoles() {
    return this.config?.roles || {};
  }
}

module.exports = new ConfigService();