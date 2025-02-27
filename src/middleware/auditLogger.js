const AuditLog = require('../models/AuditLog');

const createAuditLog = async (action, resourceType, resourceId, patientId, changes, user) => {
  try {
    await AuditLog.create({
      action,
      resourceType,
      resourceId,
      patientId,
      changes,
      performedBy: {
        userId: user._id,
        userRole: user.role
      }
    });
  } catch (error) {
    console.error('Audit Log Creation Failed:', error);
    // Don't throw error to prevent blocking the main operation
  }
};

module.exports = {
  createAuditLog
}; 