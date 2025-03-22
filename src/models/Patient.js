const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    // Remove the required: true since we're auto-generating it
  },
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required']
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required']
    }
  },
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          // Allow null/empty email or validate format
          return !v || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
      unique: true
    },
    address: {
      street: String,
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: {
        type: String,
        required: [true, 'State is required']
      },
      pincode: String
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required']
    },
    relationship: String,
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    }
  },
  medicalHistory: {
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    pastSurgeries: [{
      surgeryType: String,
      date: Date,
      hospital: String
    }]
  },
  registrationType: {
    type: String,
    enum: ['OPD', 'A&E'],
    required: true
  },
  emergencyDetails: {
    injuryType: {
      type: String,
      required: function() {
        return this.registrationType === 'A&E';
      }
    },
    severity: {
      type: String,
      enum: ['Critical', 'Serious', 'Moderate', 'Stable'],
      required: function() {
        return this.registrationType === 'A&E';
      }
    },
    arrivalMode: {
      type: String,
      enum: ['Ambulance', 'Walk-in', 'Police', 'Others'],
      required: function() {
        return this.registrationType === 'A&E';
      }
    },
    chiefComplaint: {
      type: String,
      required: function() {
        return this.registrationType === 'A&E';
      }
    },
    triageTime: {
      type: Date,
      default: Date.now
    },
    vitalSigns: {
      bloodPressure: String,
      pulseRate: Number,
      temperature: Number,
      oxygenSaturation: Number
    }
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate patientId
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    try {
      // Generate a unique patient ID (e.g., PT-2024-0001)
      const date = new Date();
      const year = date.getFullYear();
      const count = await mongoose.model('Patient').countDocuments();
      this.patientId = `PT-${year}-${(count + 1).toString().padStart(4, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Add a pre-save hook to check for duplicate phone numbers
patientSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingPatient = await this.constructor.findOne({
      'contactInfo.phone': this.contactInfo.phone
    });
    
    if (existingPatient) {
      const error = new Error('Patient with this phone number already exists');
      error.code = 11000; // Duplicate key error code
      return next(error);
    }
  }
  next();
});

// Add error handling middleware
patientSchema.post('save', function(error, doc, next) {
  if (error.code === 11000) {
    next(new Error('Patient with this phone number already exists'));
  } else {
    next(error);
  }
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient; 