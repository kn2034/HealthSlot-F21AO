const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Patient = require('../models/Patient');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Disconnect from any existing connection
  await mongoose.disconnect();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Patient Registration API Tests', () => {
  // Test Case 1: Successful OPD Registration
  describe('POST /api/patients/register-opd', () => {
    it('should successfully register an OPD patient', async () => {
      const validPatient = {
        personalInfo: {
          firstName: "Test",
          lastName: "Patient",
          dateOfBirth: "1990-01-01",
          gender: "Male",
          bloodGroup: "O+"
        },
        contactInfo: {
          email: "test.patient@email.com",
          phone: "9876543210",
          address: {
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001"
          }
        },
        emergencyContact: {
          name: "Emergency Contact",
          relationship: "Spouse",
          phone: "9876543211"
        }
      };

      const response = await request(app)
        .post('/api/patients/register-opd')
        .send(validPatient);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('patientId');
      expect(response.body.data.registrationType).toBe('OPD');
    });

    it('should fail when required fields are missing', async () => {
      const invalidPatient = {
        personalInfo: {
          firstName: "Test"
          // Missing required fields
        }
      };

      const response = await request(app)
        .post('/api/patients/register-opd')
        .send(invalidPatient);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation Error');
    });
  });

  // Test Case 2: Successful A&E Registration
  describe('POST /api/patients/register-ae', () => {
    it('should successfully register an A&E patient', async () => {
      const validPatient = {
        personalInfo: {
          firstName: "Emergency",
          lastName: "Patient",
          dateOfBirth: "1985-05-15",
          gender: "Female",
          bloodGroup: "B+"
        },
        contactInfo: {
          phone: "9876543212",
          address: {
            city: "Mumbai",
            state: "Maharashtra"
          }
        },
        emergencyContact: {
          name: "Emergency Contact",
          relationship: "Sibling",
          phone: "9876543213"
        },
        emergencyDetails: {
          injuryType: "Head Trauma",
          arrivalMode: "Ambulance",
          chiefComplaint: "Severe head injury from accident",
          vitalSigns: {
            bloodPressure: "140/90",
            pulseRate: 95,
            temperature: 37.5,
            oxygenSaturation: 94
          }
        }
      };

      const response = await request(app)
        .post('/api/patients/register-ae')
        .send(validPatient);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('patientId');
      expect(response.body.data.registrationType).toBe('A&E');
      expect(response.body.data).toHaveProperty('severity');
    });
  });

  // Test Case 3: Duplicate Patient Check
  describe('Duplicate Patient Prevention', () => {
    it('should prevent duplicate patient registration with same phone number', async () => {
      const patient = {
        personalInfo: {
          firstName: "Test",
          lastName: "Patient",
          dateOfBirth: "1990-01-01",
          gender: "Male",
          bloodGroup: "O+"
        },
        contactInfo: {
          email: "test.patient@email.com",
          phone: "9876543210",
          address: {
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001"
          }
        },
        emergencyContact: {
          name: "Emergency Contact",
          relationship: "Spouse",
          phone: "9876543211"
        }
      };

      // First registration
      const firstResponse = await request(app)
        .post('/api/patients/register-opd')
        .send(patient);
      
      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body.success).toBe(true);

      // Attempt duplicate registration
      const duplicateResponse = await request(app)
        .post('/api/patients/register-opd')
        .send(patient);

      expect(duplicateResponse.status).toBe(400);
      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.message).toBe('Patient with this phone number already exists');
    });
  });

  // Test Case 4: Validation Tests
  describe('Input Validation', () => {
    it('should validate phone number format', async () => {
      const patient = {
        personalInfo: {
          firstName: "Test",
          lastName: "Patient",
          dateOfBirth: "1990-01-01",
          gender: "Male",
          bloodGroup: "O+"
        },
        contactInfo: {
          email: "test.patient@email.com",
          phone: "123", // Invalid phone number
          address: {
            city: "Mumbai",
            state: "Maharashtra"
          }
        },
        emergencyContact: {
          name: "Emergency Contact",
          relationship: "Spouse",
          phone: "9876543211"
        }
      };

      const response = await request(app)
        .post('/api/patients/register-opd')
        .send(patient);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation Error');
    });

    it('should validate email format', async () => {
      const patient = {
        personalInfo: {
          firstName: "Test",
          lastName: "Patient",
          dateOfBirth: "1990-01-01",
          gender: "Male",
          bloodGroup: "O+"
        },
        contactInfo: {
          email: "invalid-email", // Invalid email
          phone: "9876543210",
          address: {
            city: "Mumbai",
            state: "Maharashtra"
          }
        },
        emergencyContact: {
          name: "Emergency Contact",
          relationship: "Spouse",
          phone: "9876543211"
        }
      };

      const response = await request(app)
        .post('/api/patients/register-opd')
        .send(patient);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation Error');
    });
  });
}); 