const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');

// POST: Register a new lab test
router.post('/register-test', async (req, res) => {
  try {
    const { test_name, test_type, patient_id } = req.body;

    // Validate required fields
    if (!test_name || !test_type || !patient_id) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    // Create new lab test entry
    const newLabTest = new LabTest({ test_name, test_type, patient_id });
    await newLabTest.save();

    res.status(201).json({ message: 'Lab test registered successfully.', labTest: newLabTest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
