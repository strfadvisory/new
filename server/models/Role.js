const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Primary', 'Secondary', 'Members'] },
  description: { type: String, required: true },
  icon: { type: String },
  status: { type: Boolean, default: true },
  permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Role', roleSchema);
