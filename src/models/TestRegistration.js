const mongoose = require('mongoose');

const testRegistrationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  testType: {
    type: String,
    required: [true, 'Test type is required'],
    enum: ['Blood Test', 'Urine Test', 'X-Ray', 'CT Scan', 'MRI', 'ECG', 'EEG']
  },
  priority: {
    type: String,
    enum: ['Routine', 'Urgent', 'Emergency'],
    default: 'Routine'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requesting doctor ID is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String
  },
  scheduledDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestRegistration', testRegistrationSchema); 