const Admission = require('../models/Admission');
const Ward = require('../models/Ward');
const Patient = require('../models/Patient');
const { createAuditLog } = require('../utils/auditLog');

const admitPatient = async (req, res) => {
  try {
    const {
      patientId,
      wardId,
      bedNumber,
      expectedDischargeDate,
      admittingDoctor,
      admissionType,
      diagnosis,
      notes
    } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check for existing active admission
    const existingAdmission = await Admission.findOne({
      patientId,
      status: { $in: ['Admitted', 'Transferred'] }
    });

    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        message: 'Patient already has an active admission',
        data: {
          existingAdmissionId: existingAdmission._id,
          currentStatus: existingAdmission.status,
          wardNumber: existingAdmission.wardId
        }
      });
    }

    // Check if ward exists and has available beds
    const ward = await Ward.findById(wardId);
    if (!ward) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found'
      });
    }

    // Check if bed is available
    if (ward.occupiedBeds >= ward.totalBeds) {
      return res.status(400).json({
        success: false,
        message: 'No beds available in this ward'
      });
    }

    // Check if specific bed number is already occupied
    const bedOccupied = await Admission.findOne({
      wardId,
      bedNumber,
      status: { $in: ['Admitted', 'Transferred'] }
    });

    if (bedOccupied) {
      return res.status(400).json({
        success: false,
        message: 'Selected bed is already occupied',
        data: {
          wardNumber: ward.wardNumber,
          bedNumber: bedNumber
        }
      });
    }

    // Create admission record
    const admission = new Admission({
      patientId,
      wardId,
      bedNumber,
      expectedDischargeDate,
      admittingDoctor,
      admissionType,
      diagnosis,
      notes,
      status: 'Admitted',
      statusHistory: [{
        status: 'Admitted',
        changedAt: new Date(),
        reason: 'Initial admission',
        notes: notes,
        changedBy: {
          userId: req.user._id.toString(),
          userRole: req.user.role
        }
      }]
    });

    await admission.save();

    // Update ward bed count
    ward.occupiedBeds += 1;
    await ward.save();

    // Create audit log
    await createAuditLog({
      action: 'ADMIT',
      resourceType: 'Admission',
      resourceId: admission._id,
      patientId: patient._id,
      changes: {
        status: 'Admitted',
        wardNumber: ward.wardNumber,
        bedNumber: bedNumber
      },
      performedBy: {
        userId: req.user._id,
        userRole: req.user.role
      }
    });

    res.status(201).json({
      success: true,
      message: 'Patient admitted successfully',
      data: {
        admissionId: admission._id,
        wardNumber: ward.wardNumber,
        bedNumber: admission.bedNumber,
        admissionDate: admission.admissionDate,
        status: admission.status
      }
    });

  } catch (error) {
    console.error('Error in admitPatient:', error);
    res.status(500).json({
      success: false,
      message: 'Error admitting patient',
      error: error.message
    });
  }
};

const getAdmissionDetails = async (req, res) => {
  try {
    const { admissionId } = req.params;
    
    const admission = await Admission.findById(admissionId)
      .populate('patientId', 'personalInfo.firstName personalInfo.lastName')
      .populate('wardId', 'wardNumber wardType')
      .populate('admittingDoctor', 'fullName');

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admission details',
      error: error.message
    });
  }
};

const getAdmissionStatus = async (req, res) => {
  try {
    const { admissionId } = req.params;

    const admission = await Admission.findById(admissionId)
      .populate('patientId', 'personalInfo.firstName personalInfo.lastName patientId')
      .populate('wardId', 'wardNumber wardType')
      .populate('admittingDoctor', 'fullName');

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        admissionId: admission._id,
        patientInfo: {
          name: `${admission.patientId.personalInfo.firstName} ${admission.patientId.personalInfo.lastName}`,
          patientId: admission.patientId.patientId
        },
        wardInfo: {
          wardNumber: admission.wardId.wardNumber,
          wardType: admission.wardId.wardType
        },
        bedNumber: admission.bedNumber,
        currentStatus: admission.status,
        admissionDate: admission.admissionDate,
        expectedDischargeDate: admission.expectedDischargeDate,
        actualDischargeDate: admission.actualDischargeDate,
        admittingDoctor: admission.admittingDoctor?.fullName,
        statusHistory: admission.statusHistory.map(history => ({
          status: history.status,
          changedAt: history.changedAt,
          reason: history.reason,
          notes: history.notes,
          changedBy: history.changedBy.userRole
        })),
        transferHistory: admission.transferHistory.map(transfer => ({
          fromWard: transfer.fromWard,
          toWard: transfer.toWard,
          fromBed: transfer.fromBed,
          toBed: transfer.toBed,
          transferDate: transfer.transferDate,
          reason: transfer.reason,
          notes: transfer.notes
        }))
      }
    });

  } catch (error) {
    console.error('Error in getAdmissionStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admission status',
      error: error.message
    });
  }
};

module.exports = {
  admitPatient,
  getAdmissionDetails,
  getAdmissionStatus
}; 