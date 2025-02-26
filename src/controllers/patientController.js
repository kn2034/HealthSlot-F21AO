const Patient = require('../models/Patient');
const { validateOPDRegistration } = require('../validation/patientValidation');

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
    const auditLog = {
      action: 'REGISTER',
      resourceType: 'Patient',
      resourceId: patient._id,
      changes: {
        registrationType: 'OPD',
        patientId: patient.patientId
      }
    };

    const savedLog = await createAuditLog(auditLog);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully for OPD',
      data: {
        patientId: patient.patientId,
        mongoId: patient._id,
        name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        registrationType: patient.registrationType,
        registrationDate: patient.createdAt,
        auditLogCreated: !!savedLog
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

module.exports = {
  registerOPDPatient
}; 