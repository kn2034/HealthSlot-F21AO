const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema({
  testRegistrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestRegistration',
    required: [true, 'Test registration ID is required']
  },
  result: {
    type: String,
    required: [true, 'Test result is required']
  },
  notes: {
    type: String
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lab technician ID is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Completed'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabResult', labResultSchema); 