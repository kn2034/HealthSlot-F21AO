// Function to determine patient severity based on emergency details
const determinePatientSeverity = (emergencyDetails) => {
  let severityScore = 0;

  // Check vital signs
  if (emergencyDetails.vitalSigns) {
    const { bloodPressure, pulseRate, temperature, oxygenSaturation } = emergencyDetails.vitalSigns;

    // Blood pressure check (systolic/diastolic)
    if (bloodPressure) {
      const [systolic, diastolic] = bloodPressure.split('/').map(Number);
      if (systolic > 180 || systolic < 90 || diastolic > 120 || diastolic < 60) {
        severityScore += 2;
      }
    }

    // Pulse rate check
    if (pulseRate) {
      if (pulseRate > 120 || pulseRate < 50) {
        severityScore += 2;
      }
    }

    // Temperature check
    if (temperature) {
      if (temperature > 39 || temperature < 35) {
        severityScore += 2;
      }
    }

    // Oxygen saturation check
    if (oxygenSaturation) {
      if (oxygenSaturation < 92) {
        severityScore += 3;
      }
    }
  }

  // Check arrival mode
  if (emergencyDetails.arrivalMode === 'Ambulance') {
    severityScore += 2;
  }

  // Check injury type and chief complaint
  const criticalKeywords = [
    'trauma', 'accident', 'chest pain', 'breathing', 'unconscious',
    'bleeding', 'head', 'stroke', 'heart', 'severe'
  ];

  const lowercaseComplaint = emergencyDetails.chiefComplaint.toLowerCase();
  const lowercaseInjury = emergencyDetails.injuryType.toLowerCase();

  criticalKeywords.forEach(keyword => {
    if (lowercaseComplaint.includes(keyword) || lowercaseInjury.includes(keyword)) {
      severityScore += 1;
    }
  });

  // Determine severity level based on score
  if (severityScore >= 6) {
    return 'Critical';
  } else if (severityScore >= 4) {
    return 'Serious';
  } else if (severityScore >= 2) {
    return 'Moderate';
  } else {
    return 'Stable';
  }
};

module.exports = {
  determinePatientSeverity
}; 