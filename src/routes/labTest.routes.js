const express = require('express');
const router = express.Router();
const {
  createLabTest,
  getLabTests,
  getLabTestById,
  updateLabTest,
  deleteLabTest
} = require('../controllers/labTest.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/lab/tests:
 *   post:
 *     tags:
 *       - Laboratory
 *     summary: Create a new lab test
 *     description: Create a new lab test (Admin and lab technician only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *               - price
 *               - turnaroundTime
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [blood, urine, imaging, other]
 *               price:
 *                 type: number
 *               turnaroundTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lab test created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post('/', protect, authorize('admin', 'lab_technician'), createLabTest);

/**
 * @swagger
 * /api/lab/tests:
 *   get:
 *     tags:
 *       - Laboratory
 *     summary: Get all lab tests
 *     description: Retrieve all active lab tests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of lab tests
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/', protect, getLabTests);

/**
 * @swagger
 * /api/lab/tests/{id}:
 *   get:
 *     tags:
 *       - Laboratory
 *     summary: Get a lab test by ID
 *     description: Retrieve a single lab test by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lab test details
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Lab test not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getLabTestById);

/**
 * @swagger
 * /api/lab/tests/{id}:
 *   put:
 *     tags:
 *       - Laboratory
 *     summary: Update a lab test
 *     description: Update a lab test by ID (Admin and lab technician only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [blood, urine, imaging, other]
 *               price:
 *                 type: number
 *               turnaroundTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lab test updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Lab test not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, authorize('admin', 'lab_technician'), updateLabTest);

/**
 * @swagger
 * /api/lab/tests/{id}:
 *   delete:
 *     tags:
 *       - Laboratory
 *     summary: Delete a lab test
 *     description: Soft delete a lab test by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lab test deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Lab test not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, authorize('admin'), deleteLabTest);

module.exports = router; 