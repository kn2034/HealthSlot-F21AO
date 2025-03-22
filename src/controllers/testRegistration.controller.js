const TestRegistration = require('../models/TestRegistration');
const Patient = require('../models/Patient');

// Register a new test
const registerTest = async (req, res) => {
  try {
    const { patientId, testType, priority, notes, scheduledDate } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Create new test registration
    const testRegistration = new TestRegistration({
      patientId,
      testType,
      priority,
      notes,
      scheduledDate,
      requestedBy: req.user._id // From auth middleware
    });

    await testRegistration.save();

    res.status(201).json({
      success: true,
      message: 'Test registered successfully',
      data: testRegistration
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

// Get all test registrations
const getTestRegistrations = async (req, res) => {
  try {
    const registrations = await TestRegistration.find()
      .populate('patientId', 'personalInfo.firstName personalInfo.lastName')
      .populate('requestedBy', 'fullName');

    res.status(200).json({
      success: true,
      data: registrations
    });

  } catch (error) {
    console.error('Error in getTestRegistrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test registrations',
      error: error.message
    });
  }
};

module.exports = {
  registerTest,
  getTestRegistrations
}; 