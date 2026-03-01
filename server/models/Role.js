const mongoose = require('mongoose');

const nextStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  completed: { type: Boolean, default: false }
}, { _id: true });

const grandChildRoleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Members'] },
  description: { type: String, required: true },
  icon: { type: String },
  status: { type: Boolean, default: true },
  permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  canEditPermissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  nextSteps: [nextStepSchema],
  video: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: true, timestamps: true });

const childRoleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Secondary', 'Members'] },
  description: { type: String, required: true },
  icon: { type: String },
  status: { type: Boolean, default: true },
  permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  canEditPermissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  childRoles: [grandChildRoleSchema],
  nextSteps: [nextStepSchema],
  video: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: true, timestamps: true });

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Primary', 'Secondary', 'Members'] },
  description: { type: String, required: true },
  icon: { type: String },
  status: { type: Boolean, default: true },
  permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  canEditPermissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  childRoles: [childRoleSchema],
  nextSteps: [nextStepSchema],
  video: [{ type: mongoose.Schema.Types.Mixed }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Role', roleSchema);
