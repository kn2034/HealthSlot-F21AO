const LabResult = require('../models/LabResult');
const TestRegistration = require('../models/TestRegistration');

// Add a new test result
const addTestResult = async (req, res) => {
  try {
    const { testRegistrationId, result, notes } = req.body;

    // Check if test registration exists
    const testRegistration = await TestRegistration.findById(testRegistrationId);
    if (!testRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Test registration not found'
      });
    }

    // Create new lab result
    const labResult = new LabResult({
      testRegistrationId,
      result,
      notes,
      technician: req.user._id // From auth middleware
    });

    await labResult.save();

    // Update test registration status
    testRegistration.status = 'Completed';
    await testRegistration.save();

    res.status(201).json({
      success: true,
      message: 'Test result added successfully',
      data: labResult
    });

  } catch (error) {
    console.error('Error in addTestResult:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding test result',
      error: error.message
    });
  }
};

// Get all test results
const getTestResults = async (req, res) => {
  try {
    const results = await LabResult.find()
      .populate('testRegistrationId', 'patientId testType priority')
      .populate('technician', 'fullName')
      .populate('verifiedBy', 'fullName');

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error in getTestResults:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test results',
      error: error.message
    });
  }
};

// Get test result by ID
const getTestResultById = async (req, res) => {
  try {
    const result = await LabResult.findById(req.params.id)
      .populate('testRegistrationId', 'patientId testType priority')
      .populate('technician', 'fullName')
      .populate('verifiedBy', 'fullName');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in getTestResultById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test result',
      error: error.message
    });
  }
};

module.exports = {
  addTestResult,
  getTestResults,
  getTestResultById
}; 