const Patient = require('../models/Patient');
const { validateOPDRegistration, validateAERegistration } = require('../validation/patientValidation');
const { createAuditLog } = require('../utils/auditLog');
const { determinePatientSeverity } = require('../utils/severityCalculator');

const registerOPDPatient = async (req, res) => {
  try {
    // Validate request data
    const { error } = validateOPDRegistration(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Create new patient
    const patientData = {
      ...req.body,
      registrationType: 'OPD'
    };
    
    // Check for existing patient
    const existingPatient = await Patient.findOne({
      'contactInfo.phone': patientData.contactInfo.phone
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this phone number already exists'
      });
    }

    const patient = new Patient(patientData);
    await patient.save();

    // Create audit log
    try {
      const auditLog = {
        action: 'REGISTER',
        resourceType: 'Patient',
        resourceId: patient._id,
        patientId: patient._id,
        changes: {
          registrationType: 'OPD',
          patientId: patient._id
        },
        performedBy: {
          userId: req.user ? req.user._id : '000000000000000000000000', // 24-character hex string for system user
          userRole: req.user ? req.user.role : 'SYSTEM'
        }
      };

      await createAuditLog(auditLog);
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
      // Continue with the response even if audit log fails
    }

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully for OPD',
      data: {
        patientId: patient._id,
        name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        registrationType: patient.registrationType,
        registrationDate: patient.createdAt
      }
    });

  } catch (error) {
    console.error('Error in registerOPDPatient:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error registering OPD patient',
      error: error.message
    });
  }
};

const registerAEPatient = async (req, res) => {
  try {
    // Validate request data
    const { error } = validateAERegistration(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check for existing patient
    const existingPatient = await Patient.findOne({
      'contactInfo.phone': req.body.contactInfo.phone
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this phone number already exists'
      });
    }

    // Determine severity based on emergency details
    const severity = determinePatientSeverity(req.body.emergencyDetails);

    // Create new patient with severity
    const patientData = {
      ...req.body,
      registrationType: 'A&E',
      emergencyDetails: {
        ...req.body.emergencyDetails,
        severity
      }
    };

    const patient = new Patient(patientData);
    await patient.save();

    // Create audit log
    try {
      const auditLog = {
        action: 'REGISTER',
        resourceType: 'Patient',
        resourceId: patient._id,
        patientId: patient._id,
        changes: {
          registrationType: 'A&E',
          patientId: patient._id,
          severity
        },
        performedBy: {
          userId: req.user ? req.user._id : '000000000000000000000000', // 24-character hex string for system user
          userRole: req.user ? req.user.role : 'SYSTEM'
        }
      };

      await createAuditLog(auditLog);
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
      // Continue with the response even if audit log fails
    }

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully for A&E',
      data: {
        patientId: patient._id,
        name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        registrationType: patient.registrationType,
        severity,
        registrationDate: patient.createdAt
      }
    });

  } catch (error) {
    console.error('Error in registerAEPatient:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error registering A&E patient',
      error: error.message
    });
  }
};

module.exports = {
  registerOPDPatient,
  registerAEPatient
}; 