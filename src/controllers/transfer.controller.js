const Admission = require('../models/Admission');
const Ward = require('../models/Ward');
const { createAuditLog } = require('../utils/auditLog');

const transferPatient = async (req, res) => {
  try {
    const {
      admissionId,
      newWardId,
      newBedNumber,
      reason,
      notes
    } = req.body;

    // Get the complete admission document
    const admission = await Admission.findById(admissionId)
      .populate('wardId')
      .exec();

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Get the new ward
    const newWard = await Ward.findById(newWardId);
    if (!newWard) {
      return res.status(404).json({
        success: false,
        message: 'New ward not found'
      });
    }

    // Store current ward details
    const currentWard = await Ward.findById(admission.wardId);
    const oldWardDetails = {
      wardId: admission.wardId,
      wardNumber: currentWard.wardNumber,
      bedNumber: admission.bedNumber
    };

    // Create new status history entry
    const statusHistoryEntry = {
      status: 'Transferred',
      changedAt: new Date(),
      reason: reason || 'Patient transfer',
      notes: notes || 'Transfer to new ward',
      changedBy: {
        userId: req.user._id.toString(),
        userRole: req.user.role
      }
    };

    // Create new transfer history entry
    const transferHistoryEntry = {
      fromWard: admission.wardId,
      toWard: newWardId,
      fromBed: admission.bedNumber,
      toBed: newBedNumber,
      transferDate: new Date(),
      reason,
      notes
    };

    // Update the admission document
    const updatedAdmission = await Admission.findByIdAndUpdate(
      admissionId,
      {
        $set: {
          wardId: newWardId,
          bedNumber: newBedNumber,
          status: 'Transferred'
        },
        $push: {
          statusHistory: statusHistoryEntry,
          transferHistory: transferHistoryEntry
        }
      },
      { new: true, runValidators: true }
    );

    // Update ward bed counts
    await Promise.all([
      Ward.findByIdAndUpdate(currentWard._id, { $inc: { occupiedBeds: -1 } }),
      Ward.findByIdAndUpdate(newWard._id, { $inc: { occupiedBeds: 1 } })
    ]);

    // Create audit log
    await createAuditLog({
      action: 'TRANSFER',
      resourceType: 'Admission',
      resourceId: admission._id,
      patientId: admission.patientId,
      changes: {
        fromWard: currentWard.wardNumber,
        toWard: newWard.wardNumber,
        fromBed: oldWardDetails.bedNumber,
        toBed: newBedNumber
      },
      performedBy: {
        userId: req.user._id.toString(),
        userRole: req.user.role
      }
    });

    res.status(200).json({
      success: true,
      message: 'Patient transferred successfully',
      data: {
        admissionId: updatedAdmission._id,
        newWardNumber: newWard.wardNumber,
        newBedNumber,
        transferDate: new Date(),
        previousWard: currentWard.wardNumber,
        status: updatedAdmission.status
      }
    });

  } catch (error) {
    console.error('Error in transferPatient:', error);
    res.status(500).json({
      success: false,
      message: 'Error transferring patient',
      error: error.message
    });
  }
};

module.exports = {
  transferPatient
}; 