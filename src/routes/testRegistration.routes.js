const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  registerTest,
  getTestRegistrations
} = require('../controllers/testRegistration.controller');

/**
 * @swagger
 * /api/lab/test-registration:
 *   post:
 *     tags:
 *       - Lab Tests
 *     summary: Register a new lab test
 *     description: Register a new lab test for a patient (Doctors and Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - testType
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: ID of the patient
 *               testType:
 *                 type: string
 *                 enum: [Blood Test, Urine Test, X-Ray, CT Scan, MRI, ECG, EEG]
 *               priority:
 *                 type: string
 *                 enum: [Routine, Urgent, Emergency]
 *                 default: Routine
 *               notes:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Test registered successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Doctors and Admin only
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.post('/test-registration', protect, authorize('admin', 'doctor'), registerTest);

/**
 * @swagger
 * /api/lab/test-registrations:
 *   get:
 *     tags:
 *       - Lab Tests
 *     summary: Get all test registrations
 *     description: Retrieve all lab test registrations (Doctors, Lab Technicians and Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test registrations retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Doctors, Lab Technicians and Admin only
 *       500:
 *         description: Server error
 */
router.get('/test-registrations', protect, authorize('admin', 'doctor', 'lab_technician'), getTestRegistrations);

module.exports = router; 