const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  designation: { type: String },
  phone: { type: String },
  profileImageId: { type: mongoose.Schema.Types.ObjectId },
  password: { type: String, required: true },
  address: {
    zipCode: String,
    state: String,
    city: String,
    address1: String,
    address2: String
  },
  companyType: String,
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  role: { type: String, default: 'USER' },
  roleType: { type: String },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended', 'pending'], default: 'Active' },
  isSuperAdmin: { type: Boolean, default: false },
  orgId: { type: String },
  level: { type: String },
  verificationToken: String,
  verificationTokenExpiry: Date,
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentcompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  memberfor: [{
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String
  }],
  reqorg: [{
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      default: 'pending'
    }
  }],
  companyProfile: {
    companyName: String,
    description: String,
    phone: String,
    email: String,
    contactPerson: String,
    linkedinUrl: String,
    websiteLink: String,
    zipCode: String,
    state: String,
    city: String,
    address1: String,
    address2: String,
    logoId: String
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);