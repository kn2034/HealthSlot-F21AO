const mongoose = require('mongoose');

const testRegistrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest',
    required: true
  },
  admissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission'
    // Optional - only for admitted patients
  },
  requestedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userRole: {
      type: String,
      required: true
    }
  },
  priority: {
    type: String,
    enum: ['Routine', 'Urgent', 'Emergency'],
    default: 'Routine'
  },
  status: {
    type: String,
    enum: ['Registered', 'Collected', 'Processing', 'Completed', 'Delivered', 'Cancelled'],
    default: 'Registered'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  collectionType: {
    type: String,
    enum: ['Lab Visit', 'Home Collection', 'Ward Collection'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Refunded'],
    default: 'Pending'
  },
  notes: String
}, {
  timestamps: true
});

// Changed from pre('save') to pre('validate')
testRegistrationSchema.pre('validate', async function(next) {
  if (!this.registrationId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('TestRegistration').countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
      }
    });
    this.registrationId = `TR${year}${month}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

testRegistrationSchema.index({ registrationId: 1 }, { unique: true });
testRegistrationSchema.index({ patientId: 1, status: 1 });
testRegistrationSchema.index({ scheduledDate: 1 });

const TestRegistration = mongoose.model('TestRegistration', testRegistrationSchema);

module.exports = TestRegistration; 