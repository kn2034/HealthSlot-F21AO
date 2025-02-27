const TestResult = require('../models/TestResult');
const TestRegistration = require('../models/TestRegistration');
const Patient = require('../models/Patient');
const { createAuditLog } = require('../utils/auditLog');

const getTestResults = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate, status } = req.query;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Build query
    const query = { patientId };
    if (startDate && endDate) {
      query.resultDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (status) {
      query.status = status;
    }

    // Fetch results with populated references
    const results = await TestResult.find(query)
      .populate('testId', 'name category testId')
      .sort({ resultDate: -1 });

    // Format response with null checks
    const formattedResults = results.map(result => ({
      resultId: result._id,
      testName: result.testId?.name || 'Unknown Test',
      testCategory: result.testId?.category || 'Unknown Category',
      testId: result.testId?.testId || result.testId,
      resultDate: result.resultDate,
      status: result.status,
      resultValues: result.resultValues,
      conclusion: result.conclusion,
      remarks: result.remarks,
      reportUrl: result.reportUrl,
      imageUrls: result.imageUrls,
      verifiedBy: {
        role: result.verifiedBy.userRole,
        verifiedAt: result.verifiedBy.verifiedAt
      }
    }));

    // Create audit log
    await createAuditLog({
      action: 'TEST_RESULT',
      resourceType: 'TestResult',
      resourceId: results[0]?._id || patientId,
      patientId: patient._id,
      changes: {
        action: 'View Results',
        count: results.length
      },
      performedBy: {
        userId: req.user._id,
        userRole: req.user.role
      }
    });

    res.status(200).json({
      success: true,
      count: results.length,
      data: formattedResults
    });

  } catch (error) {
    console.error('Error in getTestResults:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving test results',
      error: error.message
    });
  }
};

const addTestResult = async (req, res) => {
  try {
    const testResult = new TestResult({
      ...req.body,
      verifiedBy: {
        userId: req.user._id,
        userRole: req.user.role
      }
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
      data: testResult
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

module.exports = {
  getTestResults,
  addTestResult
}; 