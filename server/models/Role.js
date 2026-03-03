const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  type: { type: String, enum: ['Master', 'User'], required: true },
  status: { type: Boolean, default: true },
  permissions: [{ type: String }],
  nextSteps: [{ type: String }],
  videos: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

roleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Role', roleSchema);
