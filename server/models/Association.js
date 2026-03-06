const mongoose = require('mongoose');

const associationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  icon: { 
    type: String 
  },
  status: { 
    type: Boolean, 
    default: true 
  },
  permissions: [{
    type: String
  }],
  address: {
    zipCode: String,
    state: String,
    city: String,
    address1: String,
    address2: String
  },
  contactPerson: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  linkedinUrl: {
    type: String,
    trim: true
  },
  websiteUrl: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Association', associationSchema);