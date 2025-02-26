const express = require('express');
const router = express.Router();
const { 
    registerOPDPatient, 
    registerAEPatient, 
    getPatientAuditLogs,
    getAllAuditLogs 
} = require('../controllers/patientController');

/**
 * @swagger
 * /api/patients/register-opd:
 *   post:
 *     tags:
 *       - Patients
 *     summary: Register a new OPD patient
 *     description: Register a new patient for Outpatient Department
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personalInfo
 *               - contactInfo
 *             properties:
 *               personalInfo:
 *                 $ref: '#/components/schemas/PersonalInfo'
 *               contactInfo:
 *                 $ref: '#/components/schemas/ContactInfo'
 *               emergencyContact:
 *                 $ref: '#/components/schemas/EmergencyContact'
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/register-opd', registerOPDPatient);

/**
 * @swagger
 * /api/patients/register-ae:
 *   post:
 *     tags:
 *       - Patients
 *     summary: Register a new A&E patient
 *     description: Register a new patient for Accident & Emergency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personalInfo
 *               - contactInfo
 *               - emergencyDetails
 *             properties:
 *               personalInfo:
 *                 $ref: '#/components/schemas/PersonalInfo'
 *               contactInfo:
 *                 $ref: '#/components/schemas/ContactInfo'
 *               emergencyContact:
 *                 $ref: '#/components/schemas/EmergencyContact'
 *               emergencyDetails:
 *                 $ref: '#/components/schemas/EmergencyDetails'
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/register-ae', registerAEPatient);

/**
 * @swagger
 * /api/patients/audit-logs/{patientId}:
 *   get:
 *     tags:
 *       - Audit Logs
 *     summary: Get audit logs for a specific patient
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID to fetch audit logs for
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/audit-logs/patient/:patientId', getPatientAuditLogs);

/**
 * @swagger
 * /api/patients/audit-logs:
 *   get:
 *     tags:
 *       - Audit Logs
 *     summary: Get all audit logs
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering logs
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering logs
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [OPD, A&E]
 *         description: Filter by registration type
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/audit-logs', getAllAuditLogs);

module.exports = router; 