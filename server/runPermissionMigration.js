require('dotenv').config();
const updatePermissionStructure = require('./migrations/updatePermissionStructure');

console.log('Running permission structure migration...');
updatePermissionStructure();