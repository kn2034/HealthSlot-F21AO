const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  wardNumber: {
    type: String,
    required: [true, 'Ward number is required'],
    unique: true,
    trim: true,
    match: [/^[A-Z]-\d{3}$/, 'Please enter a valid ward number (e.g., A-101)']
  },
  wardType: {
    type: String,
    required: [true, 'Ward type is required'],
    enum: ['General', 'Semi-Private', 'Private', 'ICU', 'Emergency'],
    trim: true
  },
  floor: {
    type: Number,
    required: [true, 'Floor number is required'],
    min: [0, 'Floor number cannot be negative']
  },
  totalBeds: {
    type: Number,
    required: [true, 'Total beds is required'],
    min: [1, 'Ward must have at least one bed']
  },
  occupiedBeds: {
    type: Number,
    default: 0,
    min: [0, 'Occupied beds cannot be negative']
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Closed'],
    default: 'Active'
  },
  specialization: {
    type: String,
    enum: ['General', 'Pediatric', 'Maternity', 'Surgical', 'Cardiac', 'Orthopedic', 'Psychiatric'],
    required: [true, 'Ward specialization is required']
  }
}, {
  timestamps: true
});

// Virtual field for available beds
wardSchema.virtual('availableBeds').get(function() {
  return this.totalBeds - this.occupiedBeds;
});

// Validation for occupied beds
wardSchema.path('occupiedBeds').validate(function(value) {
  return value <= this.totalBeds;
}, 'Occupied beds cannot exceed total beds');

const Ward = mongoose.model('Ward', wardSchema);

module.exports = Ward; 