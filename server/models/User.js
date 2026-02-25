const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  designation: { type: String },
  phone: { type: String },
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
  isSuperAdmin: { type: Boolean, default: false },
  orgId: { type: String },
  verificationToken: String,
  verificationTokenExpiry: Date,
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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