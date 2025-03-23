const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestRegistration',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  resultDate: {
    type: Date,
    default: Date.now
  },
  resultValues: [{
    parameter: String,
    value: mongoose.Schema.Types.Mixed,
    unit: String,
    referenceRange: String,
    interpretation: String,
    isAbnormal: Boolean
  }],
  imageUrls: [String], // For radiology results
  reportUrl: String,   // PDF report URL
  conclusion: String,
  remarks: String,
  verifiedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userRole: {
      type: String,
      required: true
    },
    verifiedAt: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['Draft', 'Verified', 'Released'],
    default: 'Draft'
  }
}, {
  timestamps: true
});

testResultSchema.index({ registrationId: 1 });
testResultSchema.index({ patientId: 1, testId: 1 });
testResultSchema.index({ resultDate: 1 });

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult; 