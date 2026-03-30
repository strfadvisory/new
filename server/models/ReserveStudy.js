const mongoose = require('mongoose');

const reserveStudySchema = new mongoose.Schema({
  studyName: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allowUser: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  associationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Association'
  },
  documents: [{
    fileName: String,
    fileId: mongoose.Schema.Types.ObjectId,
    fileSize: Number,
    mimeType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

reserveStudySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ReserveStudy', reserveStudySchema);