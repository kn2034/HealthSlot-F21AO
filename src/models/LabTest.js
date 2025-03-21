const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['blood', 'urine', 'imaging', 'other'],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  turnaroundTime: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create index for better querying performance
labTestSchema.index({ name: 1, category: 1 });

const LabTest = mongoose.model('LabTest', labTestSchema);

module.exports = LabTest;
