const Ward = require('../models/Ward');

const createWard = async (req, res) => {
  try {
    const {
      wardNumber,
      wardType,
      floor,
      totalBeds,
      specialization
    } = req.body;

    // Check if ward number already exists
    const existingWard = await Ward.findOne({ wardNumber });
    if (existingWard) {
      return res.status(400).json({
        success: false,
        message: 'Ward with this number already exists'
      });
    }

    // Create new ward
    const ward = new Ward({
      wardNumber,
      wardType,
      floor,
      totalBeds,
      specialization
    });

    await ward.save();

    res.status(201).json({
      success: true,
      message: 'Ward created successfully',
      data: ward
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating ward',
      error: error.message
    });
  }
};

module.exports = {
  createWard
}; 