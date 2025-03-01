const express = require('express');
const router = express.Router();
const { dischargePatient } = require('../controllers/discharge.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/admissions/discharge:
 *   put:
 *     tags:
 *       - Admissions
 *     summary: Discharge a patient
 *     description: Discharge an admitted patient
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - admissionId
 *             properties:
 *               admissionId:
 *                 type: string
 *               dischargeNotes:
 *                 type: string
 *               dischargeSummary:
 *                 type: string
 */
router.put('/', protect, authorize('admin', 'doctor'), dischargePatient);

module.exports = router; 