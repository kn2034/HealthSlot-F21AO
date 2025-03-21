const TestResult = require('../models/TestResult');
const TestRegistration = require('../models/TestRegistration');
const Patient = require('../models/Patient');
const { createAuditLog } = require('../utils/auditLog');

const getTestResults = async (req, res) => {
  try {
    const testResults = await TestResult.find()
      .populate('patientId', 'patientId fullName')
      .populate('testId', 'name')
      .populate('performedBy', 'username fullName');

    res.status(200).json({
      success: true,
      data: testResults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test results',
      error: error.message,
    });
  }
};

const getTestResultById = async (req, res) => {
  try {
    const testResult = await TestResult.findById(req.params.id)
      .populate('patientId', 'patientId fullName')
      .populate('testId', 'name')
      .populate('performedBy', 'username fullName');

    if (!testResult) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found',
      });
    }

    res.status(200).json({
      success: true,
      data: testResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test result',
      error: error.message,
    });
  }
};

const addTestResult = async (req, res) => {
  try {
    const { patientId, testId, result, notes } = req.body;
    const performedBy = req.user._id; // Assuming user info is added by auth middleware

    const testResult = new TestResult({
      patientId,
      testId,
      result,
      notes,
      performedBy,
      status: 'completed',
    });

    await testResult.save();

    // Create audit log
    await createAuditLog({
      action: 'TEST_RESULT',
      resourceType: 'TestResult',
      resourceId: testResult._id,
      patientId: testResult.patientId,
      changes: {
        action: 'Create Result',
        testId: testResult.testId
      },
      performedBy: {
        userId: req.user._id,
        userRole: req.user.role
      }
    });

    res.status(201).json({
      success: true,
      message: 'Test result added successfully',
      data: testResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding test result',
      error: error.message,
    });
  }
};

module.exports = {
  getTestResults,
  getTestResultById,
  addTestResult
}; 