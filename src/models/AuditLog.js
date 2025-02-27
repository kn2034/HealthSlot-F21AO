const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'UPDATE', 'DELETE',
      'REGISTER', 'ADMIT', 'DISCHARGE', 'TRANSFER',
      'TEST_REGISTER', 'TEST_CREATE', 'TEST_UPDATE', 'TEST_RESULT'
    ]
  },
  resourceType: {
    type: String,
    required: true,
    enum: [
      'Patient', 'Admission', 'Ward', 'User',
      'LabTest', 'TestRegistration', 'TestResult'
    ]
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    // Making it optional since not all actions are patient-related
    required: function() {
      return ['Patient', 'Admission', 'TestRegistration', 'TestResult'].includes(this.resourceType);
    }
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  performedBy: {
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
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  // Prevent modifications to logs
  strict: true,
  collection: 'audit_logs'
});

// Prevent updates and deletions
auditLogSchema.pre('update', function(next) {
  const err = new Error('Audit logs cannot be modified');
  next(err);
});

auditLogSchema.pre('deleteOne', function(next) {
  const err = new Error('Audit logs cannot be deleted');
  next(err);
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog; 