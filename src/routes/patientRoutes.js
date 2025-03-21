const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  registerAEPatient,
  registerOPDPatient,
  getPatientById,
  updatePatient,
  getAllPatients
} = require('../controllers/patientController');

// A&E Registration
router.post('/register-ae', protect, authorize('doctor', 'nurse'), registerAEPatient);

// OPD Registration
router.post('/register-opd', protect, authorize('doctor', 'nurse'), registerOPDPatient);

// Get all patients
router.get('/', protect, authorize('doctor', 'nurse', 'admin'), getAllPatients);

// Get patient by ID
router.get('/:id', protect, authorize('doctor', 'nurse', 'admin'), getPatientById);

// Update patient
router.put('/:id', protect, authorize('doctor', 'nurse', 'admin'), updatePatient);

module.exports = router; 