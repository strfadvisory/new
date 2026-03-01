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
  childRoles: [grandChildRoleSchema],
  nextSteps: [nextStepSchema],
  video: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: true, timestamps: true });

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Primary', 'Secondary', 'Members', 'User-Created'] },
  description: { type: String, required: true },
  icon: { type: String },
  status: { type: Boolean, default: true },
  permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  inheritedPermissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  ownPermissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  parentRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  hierarchyPath: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  level: { type: Number, default: 0 },
  childRoles: [childRoleSchema],
  nextSteps: [nextStepSchema],
  video: [{ type: mongoose.Schema.Types.Mixed }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, strict: false });

// Virtual for effective permissions
roleSchema.virtual('effectivePermissions').get(function() {
  const inherited = this.inheritedPermissions || {};
  const own = this.ownPermissions || {};
  const combined = { ...inherited };
  
  Object.keys(own).forEach(key => {
    if (inherited[key] === true || own[key] === true) {
      combined[key] = true;
    } else {
      combined[key] = false;
    }
  });
  
  return combined;
});

// Pre-save middleware to update permissions field
roleSchema.pre('save', function(next) {
  this.permissions = this.effectivePermissions;
  next();
});

module.exports = mongoose.model('Role', roleSchema);
