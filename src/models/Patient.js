const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  emergencyDetails: {
    chiefComplaint: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    vitalSigns: {
      bloodPressure: String,
      heartRate: String,
      temperature: String,
      oxygenSaturation: String
    }
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  medicalHistory: [{
    condition: String,
    diagnosis: String,
    treatment: String,
    date: Date,
  }],
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Create index for better querying performance
patientSchema.index({ patientId: 1, email: 1, phone: 1 });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient; 