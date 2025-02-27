const express = require('express');
const router = express.Router();
const testResultController = require('../controllers/testResult.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/lab/test-results/{patientId}:
 *   get:
 *     tags:
 *       - Laboratory
 *     summary: Get test results for a patient
 *     description: Retrieve all test results for a specific patient with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Verified, Released]
 *     responses:
 *       200:
 *         description: Test results retrieved successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/test-results/:patientId', 
  protect, 
  authorize('admin', 'doctor', 'lab_technician'), 
  testResultController.getTestResults
);

router.post('/test-results', 
  protect, 
  authorize('admin', 'doctor', 'lab_technician'), 
  testResultController.addTestResult
);

module.exports = router; 