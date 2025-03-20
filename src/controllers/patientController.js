const Patient = require('../models/Patient');
const { createAuditLog } = require('../utils/auditLog');

// Validation functions
const validateAERegistration = (data) => {
  // Basic validation for A&E registration
  if (!data.name || !data.phoneNumber || !data.emergencyContact) {
    throw new Error('Missing required fields for A&E registration');
  }
  return true;
};

const determinePatientSeverity = (symptoms) => {
  // Basic severity determination logic
  if (!symptoms || symptoms.length === 0) return 'LOW';
  const severityKeywords = ['severe', 'critical', 'emergency', 'acute'];
  return severityKeywords.some(keyword => 
    symptoms.toLowerCase().includes(keyword)) ? 'HIGH' : 'MEDIUM';
};

// Controller functions
const registerOPDPatient = async (req, res) => {
  try {
    const patientData = {
      ...req.body,
      registrationType: 'OPD',
      registrationDate: new Date()
    };

    const patient = new Patient(patientData);
    await patient.validate();
    const savedPatient = await patient.save();

    // Create audit log
    await createAuditLog({
      action: 'PATIENT_REGISTRATION',
      resourceType: 'Patient',
      resourceId: savedPatient._id,
      details: 'OPD Patient registration',
      userId: req.user ? req.user._id : null
    });

    return res.status(201).json({
      success: true,
      data: {
        patientId: savedPatient._id,
        registrationType: savedPatient.registrationType
      }
    });

  } catch (error) {
    console.error('Error in registerOPDPatient:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.message
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      details: error.message
    });
  }
};

const registerAEPatient = async (req, res) => {
  try {
    // Validate A&E specific fields
    validateAERegistration(req.body);

    const emergencyDetails = {
      severity: determinePatientSeverity(req.body.symptoms),
      triageNotes: req.body.triageNotes || '',
      emergencyContact: req.body.emergencyContact
    };

    const patientData = {
      ...req.body,
      registrationType: 'A&E',
      registrationDate: new Date(),
      emergencyDetails
    };

    const patient = new Patient(patientData);
    await patient.validate();
    const savedPatient = await patient.save();

    // Create audit log
    await createAuditLog({
      action: 'PATIENT_REGISTRATION',
      resourceType: 'Patient',
      resourceId: savedPatient._id,
      details: 'A&E Patient registration',
      userId: req.user ? req.user._id : null
    });

    return res.status(201).json({
      success: true,
      data: {
        patientId: savedPatient._id,
        registrationType: savedPatient.registrationType,
        severity: emergencyDetails.severity
      }
    });

  } catch (error) {
    console.error('Error in registerAEPatient:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.message
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      details: error.message
    });
  }
};

module.exports = {
  registerOPDPatient,
  registerAEPatient
}; 