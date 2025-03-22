const express = require('express');
const router = express.Router();
const { createWard, getWards } = require('../controllers/ward.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/wards:
 *   post:
 *     tags:
 *       - Wards
 *     summary: Create a new ward
 *     description: Create a new hospital ward (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wardNumber
 *               - wardType
 *               - floor
 *               - totalBeds
 *               - specialization
 *             properties:
 *               wardNumber:
 *                 type: string
 *                 example: A-101
 *               wardType:
 *                 type: string
 *                 enum: [General, Semi-Private, Private, ICU, Emergency]
 *               floor:
 *                 type: number
 *                 example: 1
 *               totalBeds:
 *                 type: number
 *                 example: 10
 *               specialization:
 *                 type: string
 *                 enum: [General, Pediatric, Maternity, Surgical, Cardiac, Orthopedic, Psychiatric]
 *     responses:
 *       201:
 *         description: Ward created successfully
 *       400:
 *         description: Invalid input or ward already exists
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.post('/', protect, authorize('admin'), createWard);

/**
 * @swagger
 * /api/wards:
 *   get:
 *     tags:
 *       - Wards
 *     summary: Get all wards
 *     description: Retrieve a list of all hospital wards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wards retrieved successfully
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/', protect, getWards);

module.exports = router; 