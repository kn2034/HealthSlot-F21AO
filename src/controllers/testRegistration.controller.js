const TestRegistration = require('../models/TestRegistration');
const Patient = require('../models/Patient');
const LabTest = require('../models/LabTest');
const { createAuditLog } = require('../utils/auditLog');

const registerTest = async (req, res) => {
  try {
    const {
      patientId,
      testId,
      admissionId,
      priority,
      scheduledDate,
      collectionType,
      notes
    } = req.body;

    // Validate patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Validate test
    const test = await LabTest.findById(testId);
    if (!test || !test.active) {
      return res.status(404).json({
        success: false,
        message: 'Test not found or inactive'
      });
    }

    // Create test registration
    const testRegistration = new TestRegistration({
      patientId,
      testId,
      admissionId,
      requestedBy: {
        userId: req.user._id,
        userRole: req.user.role
      },
      priority: priority || 'Routine',
      scheduledDate: new Date(scheduledDate),
      collectionType,
      notes
    });

    await testRegistration.save();

    // Create audit log
    await createAuditLog({
      action: 'REGISTER',
      resourceType: 'TestRegistration',
      resourceId: testRegistration._id,
      patientId: patient._id,
      changes: {
        testId: test.testId,
        testName: test.name,
        scheduledDate,
        priority,
        collectionType
      },
      performedBy: {
        userId: req.user._id,
        userRole: req.user.role
      }
    });

    res.status(201).json({
      success: true,
      message: 'Test registration successful',
      data: {
        registrationId: testRegistration.registrationId,
        patientName: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
        testName: test.name,
        scheduledDate: testRegistration.scheduledDate,
        status: testRegistration.status,
        priority: testRegistration.priority,
        collectionType: testRegistration.collectionType
      }
    });

  } catch (error) {
    console.error('Error in registerTest:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering test',
      error: error.message
    });
  }
};

module.exports = {
  registerTest
}; 