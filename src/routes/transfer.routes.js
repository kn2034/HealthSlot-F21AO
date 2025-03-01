const express = require('express');
const router = express.Router();
const { transferPatient } = require('../controllers/transfer.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/transfers/transfer:
 *   put:
 *     tags:
 *       - Transfers
 *     summary: Transfer a patient to a different ward
 *     description: Transfer an admitted patient to a new ward and bed
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
 *               - newWardId
 *               - newBedNumber
 *               - reason
 *             properties:
 *               admissionId:
 *                 type: string
 *               newWardId:
 *                 type: string
 *               newBedNumber:
 *                 type: number
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient transferred successfully
 *       400:
 *         description: Invalid input or bed not available
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Admission or ward not found
 *       500:
 *         description: Server error
 */
router.put('/transfer', protect, authorize('admin', 'doctor'), transferPatient);

module.exports = router; 