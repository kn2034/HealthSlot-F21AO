const LabTest = require('../models/LabTest');

// Create a new lab test
const createLabTest = async (req, res) => {
  try {
    const { name, description, category, price, turnaroundTime } = req.body;

    const labTest = new LabTest({
      name,
      description,
      category,
      price,
      turnaroundTime
    });

    await labTest.save();

    res.status(201).json({
      success: true,
      message: 'Lab test created successfully',
      data: labTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating lab test',
      error: error.message
    });
  }
};

// Get all lab tests
const getLabTests = async (req, res) => {
  try {
    const labTests = await LabTest.find({ isActive: true });

    res.status(200).json({
      success: true,
      data: labTests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lab tests',
      error: error.message
    });
  }
};

// Get a single lab test by ID
const getLabTestById = async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    res.status(200).json({
      success: true,
      data: labTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lab test',
      error: error.message
    });
  }
};

// Update a lab test
const updateLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lab test updated successfully',
      data: labTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating lab test',
      error: error.message
    });
  }
};

// Delete a lab test (soft delete)
const deleteLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lab test deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lab test',
      error: error.message
    });
  }
};

module.exports = {
  createLabTest,
  getLabTests,
  getLabTestById,
  updateLabTest,
  deleteLabTest
}; 