const Patient = require('../models/Patient');
const Joi = require('joi');

// Validation schemas
const emergencyDetailsSchema = Joi.object({
  chiefComplaint: Joi.string().required(),
  severity: Joi.string().valid('low', 'medium', 'high').required(),
  vitalSigns: Joi.object({
    bloodPressure: Joi.string(),
    heartRate: Joi.string(),
    temperature: Joi.string(),
    oxygenSaturation: Joi.string()
  })
});

const validateAERegistration = (data) => {
  const schema = Joi.object({
    patientId: Joi.string().required(),
    fullName: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string()
    }),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Emergency contact phone number must be exactly 10 digits'
      })
    }),
    emergencyDetails: emergencyDetailsSchema
  });

  return schema.validate(data);
};

const validateOPDRegistration = (data) => {
  const schema = Joi.object({
    patientId: Joi.string().required(),
    fullName: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string()
    }),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Emergency contact phone number must be exactly 10 digits'
      })
    })
  });

  return schema.validate(data);
};

// Register A&E patient
const registerAEPatient = async (req, res) => {
  try {
    const { error } = validateAERegistration(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const patient = new Patient({
      ...req.body,
      status: 'active'
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: 'A&E patient registered successfully',
      data: patient
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Patient with this ${field} already exists`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error registering A&E patient',
      error: error.message
    });
  }
};

// Register OPD patient
const registerOPDPatient = async (req, res) => {
  try {
    const { error } = validateOPDRegistration(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
    }

    const patient = new Patient({
      ...req.body,
      status: 'active'
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: 'OPD patient registered successfully',
      data: patient
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Patient with this ${field} already exists`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error registering OPD patient',
      error: error.message
    });
  }
};

// Get patient by ID
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
};

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ status: 'active' });

    res.status(200).json({
      success: true,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
};

module.exports = {
  registerAEPatient,
  registerOPDPatient,
  getPatientById,
  updatePatient,
  getAllPatients
}; 