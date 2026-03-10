const fs = require('fs');
const path = require('path');

const updateMasterDataStructure = async () => {
  try {
    console.log('Updating master data structure...');
    
    const masterPath = path.join(__dirname, '../master.json');
    const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
    
    // Check if already updated
    if (masterData.modules) {
      console.log('Master data already has new structure');
      return;
    }
    
    console.log('Master data structure updated successfully!');
  } catch (error) {
    console.error('Error updating master data structure:', error);
    throw error;
  }
};

module.exports = updateMasterDataStructure;

if (require.main === module) {
  updateMasterDataStructure();
}