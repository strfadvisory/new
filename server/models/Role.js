const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: false },
  type: { type: String, enum: ['Master', 'User'], required: true },
  status: { type: Boolean, default: true },
  permissions: [{ 
    permissionId: { type: String },
    canEdit: { type: Boolean, default: true },
    limit: { type: String, default: '' }
  }],
  subRoles: [{
    id: { type: String },
    role: { type: String },
    permissionLevel: { type: String, enum: ['ADMIN', 'EDITOR', 'VIEWER'] }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

roleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Role', roleSchema);
