const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Admitted', 'Transferred', 'Discharged'],
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  reason: String,
  notes: String,
  changedBy: {
    userId: {
      type: String,
      required: true
    },
    userRole: {
      type: String,
      required: true
    }
  }
});

const transferHistorySchema = new mongoose.Schema({
  fromWard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: true
  },
  toWard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: true
  },
  fromBed: {
    type: Number,
    required: true
  },
  toBed: {
    type: Number,
    required: true
  },
  transferDate: {
    type: Date,
    default: Date.now
  },
  reason: String,
  notes: String
});

const admissionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  wardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: true
  },
  bedNumber: {
    type: Number,
    required: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  expectedDischargeDate: Date,
  actualDischargeDate: Date,
  admittingDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admissionType: {
    type: String,
    enum: ['Emergency', 'Planned', 'Transfer'],
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['Admitted', 'Transferred', 'Discharged'],
    default: 'Admitted'
  },
  statusHistory: [statusHistorySchema],
  transferHistory: [transferHistorySchema]
}, {
  timestamps: true
});

// Index for quick lookups
admissionSchema.index({ patientId: 1, status: 1 });
admissionSchema.index({ wardId: 1, status: 1 });

// Validate discharge date
admissionSchema.path('actualDischargeDate').validate(function(value) {
  if (value && value < this.admissionDate) {
    throw new Error('Discharge date cannot be before admission date');
  }
  return true;
});

// Middleware to update status history on status change
admissionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      reason: this._statusChangeReason || 'Status updated',
      notes: this._statusChangeNotes,
      changedBy: this._statusChangedBy
    });
  }
  next();
});

const Admission = mongoose.model('Admission', admissionSchema);

module.exports = Admission; 