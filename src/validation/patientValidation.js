const Joi = require('joi');

// Common validation schemas
const personalInfoSchema = Joi.object({
  firstName: Joi.string().trim().required().min(2).max(50)
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  lastName: Joi.string().trim().required().min(2).max(50)
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
  dateOfBirth: Joi.date().max('now').required()
    .messages({
      'date.max': 'Date of birth cannot be in the future',
      'any.required': 'Date of birth is required'
    }),
  gender: Joi.string().valid('Male', 'Female', 'Other').required()
    .messages({
      'any.only': 'Gender must be Male, Female, or Other',
      'any.required': 'Gender is required'
    }),
  bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required()
    .messages({
      'any.only': 'Invalid blood group. Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-',
      'any.required': 'Blood group is required'
    })
});

const contactInfoSchema = Joi.object({
  email: Joi.string().email().lowercase().trim()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required()
    .messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits',
      'any.required': 'Phone number is required'
    }),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string().required()
      .messages({
        'any.required': 'City is required'
      }),
    state: Joi.string().required()
      .messages({
        'any.required': 'State is required'
      }),
    pincode: Joi.string().pattern(/^[0-9]{6}$/)
      .messages({
        'string.pattern.base': 'Pincode must be exactly 6 digits'
      })
  })
});

const emergencyContactSchema = Joi.object({
  name: Joi.string().required().min(2).max(50)
    .messages({
      'any.required': 'Emergency contact name is required',
      'string.min': 'Emergency contact name must be at least 2 characters',
      'string.max': 'Emergency contact name cannot exceed 50 characters'
    }),
  relationship: Joi.string(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required()
    .messages({
      'string.pattern.base': 'Emergency contact phone must be exactly 10 digits',
      'any.required': 'Emergency contact phone is required'
    })
});

const emergencyDetailsSchema = Joi.object({
  injuryType: Joi.string().required()
    .messages({
      'any.required': 'Injury type is required'
    }),
  arrivalMode: Joi.string().valid('Ambulance', 'Walk-in', 'Police', 'Others').required()
    .messages({
      'any.only': 'Arrival mode must be Ambulance, Walk-in, Police, or Others',
      'any.required': 'Arrival mode is required'
    }),
  chiefComplaint: Joi.string().required().min(5)
    .messages({
      'string.min': 'Chief complaint must be at least 5 characters long',
      'any.required': 'Chief complaint is required'
    }),
  vitalSigns: Joi.object({
    bloodPressure: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/)
      .messages({
        'string.pattern.base': 'Blood pressure must be in format like 120/80'
      }),
    pulseRate: Joi.number().min(0).max(300)
      .messages({
        'number.max': 'Pulse rate cannot exceed 300',
        'number.min': 'Pulse rate cannot be negative'
      }),
    temperature: Joi.number().min(30).max(45)
      .messages({
        'number.max': 'Temperature cannot exceed 45°C',
        'number.min': 'Temperature cannot be below 30°C'
      }),
    oxygenSaturation: Joi.number().min(0).max(100)
      .messages({
        'number.max': 'Oxygen saturation cannot exceed 100%',
        'number.min': 'Oxygen saturation cannot be negative'
      })
  })
});

// OPD registration validation
const validateOPDRegistration = (data) => {
  const schema = Joi.object({
    personalInfo: personalInfoSchema.required(),
    contactInfo: contactInfoSchema.required(),
    emergencyContact: emergencyContactSchema.required(),
    medicalHistory: Joi.object({
      allergies: Joi.array().items(Joi.string()),
      chronicConditions: Joi.array().items(Joi.string()),
      currentMedications: Joi.array().items(Joi.string()),
      pastSurgeries: Joi.array().items(Joi.object({
        surgeryType: Joi.string().required(),
        date: Joi.date().required(),
        hospital: Joi.string().required()
      }))
    })
  });

  return schema.validate(data, { abortEarly: false });
};

// A&E registration validation
const validateAERegistration = (data) => {
  const schema = Joi.object({
    personalInfo: personalInfoSchema.required(),
    contactInfo: contactInfoSchema.required(),
    emergencyContact: emergencyContactSchema.required(),
    emergencyDetails: emergencyDetailsSchema.required()
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  validateOPDRegistration,
  validateAERegistration
}; 