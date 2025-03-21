const mongoose = require('mongoose');

const testRegistrationSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  testId: {
    type: String,
    required: true,
    ref: 'LabTest'
  },
  doctorId: {
    type: String,
    required: true,
    ref: 'User'
  },
  registrationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Indexes
testRegistrationSchema.index({ patientId: 1, testId: 1 });
testRegistrationSchema.index({ status: 1 });
testRegistrationSchema.index({ scheduledDate: 1 });

const TestRegistration = mongoose.model('TestRegistration', testRegistrationSchema);

module.exports = TestRegistration; 