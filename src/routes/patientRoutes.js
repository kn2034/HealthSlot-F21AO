const express = require('express');
const router = express.Router();
const { 
    registerOPDPatient, 
    registerAEPatient
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

module.exports = router; 