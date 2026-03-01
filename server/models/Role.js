const mongoose = require('mongoose');

const nextStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  completed: { type: Boolean, default: false }
}, { _id: true });

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['1', '2', '3', 'Primary', 'Secondary', 'Members', 'User-Created'] },
  description: { type: String, required: true },
  icon: { type: String },
  status: { type: Boolean, default: true },
  permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  inheritedPermissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  ownPermissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  parentRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
  hierarchyPath: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  level: { type: Number, default: 0 },
  nextSteps: [nextStepSchema],
  video: [{ type: mongoose.Schema.Types.Mixed }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, strict: false });

roleSchema.index({ parentRoleId: 1 });
roleSchema.index({ createdBy: 1 });
roleSchema.index({ level: 1 });

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

roleSchema.virtual('childRoles', {
  ref: 'Role',
  localField: '_id',
  foreignField: 'parentRoleId'
});

roleSchema.pre('save', function(next) {
  this.permissions = this.effectivePermissions;
  next();
});

roleSchema.set('toJSON', { virtuals: true });
roleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Role', roleSchema);
