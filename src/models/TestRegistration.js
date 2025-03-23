const mongoose = require('mongoose');

const testRegistrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    unique: true
  },
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

// Pre-save hook to generate registrationId
testRegistrationSchema.pre('save', async function(next) {
  if (!this.registrationId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find the latest registration number for the current month
    const latestReg = await this.constructor.findOne({
      registrationId: new RegExp(`^TR${year}${month}`)
    }).sort({ registrationId: -1 });
    
    let sequence = '0001';
    if (latestReg && latestReg.registrationId) {
      const currentSequence = parseInt(latestReg.registrationId.slice(-4));
      sequence = String(currentSequence + 1).padStart(4, '0');
    }
    
    this.registrationId = `TR${year}${month}${sequence}`;
  }
  next();
});

module.exports = mongoose.model('TestRegistration', testRegistrationSchema); 