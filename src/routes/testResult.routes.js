const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  addTestResult,
  getTestResults,
  getTestResultById
} = require('../controllers/labResult.controller');

/**
 * @swagger
 * /api/lab/results:
 *   post:
 *     tags:
 *       - Lab Results
 *     summary: Add a new test result
 *     description: Add a new lab test result (Lab Technicians and Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testRegistrationId
 *               - result
 *             properties:
 *               testRegistrationId:
 *                 type: string
 *                 description: ID of the test registration
 *               result:
 *                 type: string
 *                 description: Test result details
 *               notes:
 *                 type: string
 *                 description: Additional notes about the test result
 *     responses:
 *       201:
 *         description: Test result added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Lab Technicians and Admin only
 *       404:
 *         description: Test registration not found
 *       500:
 *         description: Server error
 */
router.post('/results', protect, authorize('admin', 'lab_technician'), addTestResult);

/**
 * @swagger
 * /api/lab/results:
 *   get:
 *     tags:
 *       - Lab Results
 *     summary: Get all test results
 *     description: Retrieve all lab test results (Doctors, Lab Technicians and Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test results retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Doctors, Lab Technicians and Admin only
 *       500:
 *         description: Server error
 */
router.get('/results', protect, authorize('admin', 'doctor', 'lab_technician'), getTestResults);

/**
 * @swagger
 * /api/lab/results/{id}:
 *   get:
 *     tags:
 *       - Lab Results
 *     summary: Get a test result by ID
 *     description: Retrieve a specific lab test result by ID (Doctors, Lab Technicians and Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test result ID
 *     responses:
 *       200:
 *         description: Test result retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Doctors, Lab Technicians and Admin only
 *       404:
 *         description: Test result not found
 *       500:
 *         description: Server error
 */
router.get('/results/:id', protect, authorize('admin', 'doctor', 'lab_technician'), getTestResultById);

module.exports = router; 