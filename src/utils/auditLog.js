const AuditLog = require('../models/AuditLog');

const createAuditLog = async (logData) => {
  try {
    const auditLog = new AuditLog({
      action: logData.action,
      resourceType: logData.resourceType,
      resourceId: logData.resourceId,
      patientId: logData.patientId,
      changes: logData.changes,
      performedBy: logData.performedBy
    });

    return await auditLog.save();
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
};

module.exports = {
  createAuditLog
}; 