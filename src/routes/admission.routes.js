const express = require('express');
const router = express.Router();
const { 
  admitPatient, 
  getAdmissionStatus 
} = require('../controllers/admission.controller');
const { dischargePatient } = require('../controllers/discharge.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/admissions/admit:
 *   post:
 *     tags:
 *       - Admissions
 *     summary: Admit a patient to a ward
 *     description: Admit a patient to a specific ward and bed (Doctors and Admin only)
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
 *               - wardId
 *               - bedNumber
 *               - admissionType
 *               - diagnosis
 *             properties:
 *               patientId:
 *                 type: string
 *               wardId:
 *                 type: string
 *               bedNumber:
 *                 type: number
 *               expectedDischargeDate:
 *                 type: string
 *                 format: date
 *               admissionType:
 *                 type: string
 *                 enum: [Emergency, Planned, Transfer]
 *               diagnosis:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient admitted successfully
 *       400:
 *         description: Invalid input or bed not available
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Doctors and Admin only
 *       404:
 *         description: Patient or ward not found
 *       500:
 *         description: Server error
 */
router.post('/admit', protect, authorize('admin', 'doctor'), admitPatient);

router.get('/status/:admissionId', protect, getAdmissionStatus);

router.put('/discharge', protect, authorize('admin', 'doctor'), dischargePatient);

// Placeholder routes
router.get('/', (req, res) => {
  res.json({ message: 'Admission routes working' });
});

module.exports = router; 