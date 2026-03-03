const mongoose = require('mongoose');

const nextStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  completed: { type: Boolean, default: false }
}, { _id: true });

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  type: { type: String, enum: ['Master', 'User'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  status: { type: Boolean, default: true },
  permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  nextSteps: [nextStepSchema],
  video: [{ type: mongoose.Schema.Types.Mixed }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

roleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Role', roleSchema);
