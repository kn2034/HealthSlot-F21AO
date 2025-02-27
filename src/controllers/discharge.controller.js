const Admission = require('../models/Admission');
const Ward = require('../models/Ward');
const { createAuditLog } = require('../utils/auditLog');

const dischargePatient = async (req, res) => {
  try {
    const {
      admissionId,
      dischargeNotes,
      dischargeSummary
    } = req.body;

    // Log user information to debug
    console.log('User from request:', req.user);

    // Validate user information
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User information not found in request'
      });
    }

    // Find admission
    const admission = await Admission.findById(admissionId);
    if (!admission || admission.status === 'Discharged') {
      return res.status(404).json({
        success: false,
        message: 'Active admission not found'
      });
    }

    // Get ward
    const ward = await Ward.findById(admission.wardId);
    if (!ward) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found'
      });
    }

    // Create user info object
    const userInfo = {
      userId: req.user._id.toString(), // Convert ObjectId to string if needed
      userRole: req.user.role
    };

    console.log('User info object:', userInfo);

    // Update admission status
    admission.status = 'Discharged';
    admission.actualDischargeDate = new Date();

    // Add to status history
    const statusHistoryEntry = {
      status: 'Discharged',
      changedAt: new Date(),
      reason: 'Patient discharged',
      notes: dischargeNotes,
      changedBy: userInfo
    };

    console.log('Status history entry:', statusHistoryEntry);

    admission.statusHistory = [statusHistoryEntry];

    // Save the updated admission
    const savedAdmission = await admission.save();
    console.log('Saved admission:', savedAdmission);

    // Update ward bed count
    ward.occupiedBeds = Math.max(0, ward.occupiedBeds - 1);
    await ward.save();

    // Create audit log
    await createAuditLog({
      action: 'DISCHARGE',
      resourceType: 'Admission',
      resourceId: admission._id,
      patientId: admission.patientId,
      changes: {
        status: 'Discharged',
        wardNumber: ward.wardNumber,
        bedNumber: admission.bedNumber,
        dischargeDate: admission.actualDischargeDate
      },
      performedBy: userInfo
    });

    res.status(200).json({
      success: true,
      message: 'Patient discharged successfully',
      data: {
        admissionId: admission._id,
        dischargeDate: admission.actualDischargeDate,
        wardNumber: ward.wardNumber,
        status: admission.status,
        notes: dischargeNotes
      }
    });

  } catch (error) {
    console.error('Error in dischargePatient:', error);
    console.error('Full error object:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while discharging the patient',
      error: error.message
    });
  }
};

module.exports = {
  dischargePatient
}; 