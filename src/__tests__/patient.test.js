const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Patient = require('../models/Patient');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let mongoServer;
let authToken;
let testUser;

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

  // Create a test user
  testUser = await User.create({
    username: 'testdoctor',
    fullName: 'Test Doctor',
    email: 'test.doctor@example.com',
    password: 'password123',
    role: 'doctor',
    department: 'General Medicine'
  });

  // Generate a test token with the actual user ID
  authToken = jwt.sign(
    { userId: testUser._id, role: testUser.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
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
  
  // Recreate the test user
  testUser = await User.create({
    username: 'testdoctor',
    fullName: 'Test Doctor',
    email: 'test.doctor@example.com',
    password: 'password123',
    role: 'doctor',
    department: 'General Medicine'
  });
  
  // Regenerate the token with the new user ID
  authToken = jwt.sign(
    { userId: testUser._id, role: testUser.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
});

describe('Patient Registration API Tests', () => {
  // Test Case 1: Successful OPD Registration
  describe('POST /api/patients/register-opd', () => {
    it('should successfully register an OPD patient', async () => {
      const validPatient = {
        patientId: 'P001',
        fullName: 'Test Patient',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        email: 'test.patient@email.com',
        phone: '9876543210',
        address: {
          street: '123 Test St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '9876543211'
        }
      };

      const response = await request(app)
        .post('/api/patients/register-opd')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatient);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('patientId');
      expect(response.body.data.status).toBe('active');
    });

    it('should fail when required fields are missing', async () => {
      const invalidPatient = {
        patientId: 'P001',
        fullName: 'Test Patient'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/patients/register-opd')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPatient);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  // Test Case 2: Successful A&E Registration
  describe('POST /api/patients/register-ae', () => {
    it('should successfully register an A&E patient', async () => {
      const validPatient = {
        patientId: 'P002',
        fullName: 'Emergency Patient',
        dateOfBirth: '1985-05-15',
        gender: 'female',
        email: 'emergency.patient@email.com',
        phone: '9876543212',
        address: {
          street: '456 Emergency St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400002',
          country: 'India'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Sibling',
          phone: '9876543213'
        },
        emergencyDetails: {
          chiefComplaint: 'Severe head injury from accident',
          severity: 'high',
          vitalSigns: {
            bloodPressure: '140/90',
            heartRate: '95',
            temperature: '37.5',
            oxygenSaturation: '94'
          }
        }
      };

      const response = await request(app)
        .post('/api/patients/register-ae')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPatient);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('patientId');
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.emergencyDetails).toHaveProperty('severity');
    });
  });

  // Test Case 3: Duplicate Patient Check
  describe('Duplicate Patient Prevention', () => {
    it('should prevent duplicate patient registration with same phone number', async () => {
      const patient = {
        patientId: 'P003',
        fullName: 'Test Patient',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        email: 'test.patient@email.com',
        phone: '9876543210',
        address: {
          street: '123 Test St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '9876543211'
        }
      };

      // First registration
      const firstResponse = await request(app)
        .post('/api/patients/register-opd')
        .set('Authorization', `Bearer ${authToken}`)
        .send(patient);
      
      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body.success).toBe(true);

      // Attempt duplicate registration with different patientId but same phone
      const duplicatePatient = {
        ...patient,
        patientId: 'P004', // Different patientId
        email: 'different.email@email.com' // Different email to avoid email uniqueness conflict
      };

      const duplicateResponse = await request(app)
        .post('/api/patients/register-opd')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicatePatient);

      expect(duplicateResponse.status).toBe(400);
      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.message).toBe('Patient with this phone number already exists');
    });
  });

  // Test Case 4: Validation Tests
  describe('Input Validation', () => {
    it('should validate phone number format', async () => {
      const patient = {
        patientId: 'P004',
        fullName: 'Test Patient',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        email: 'test.patient@email.com',
        phone: '123', // Invalid phone number
        address: {
          street: '123 Test St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '9876543211'
        }
      };

      const response = await request(app)
        .post('/api/patients/register-opd')
        .set('Authorization', `Bearer ${authToken}`)
        .send(patient);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    it('should validate email format', async () => {
      const patient = {
        patientId: 'P005',
        fullName: 'Test Patient',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        email: 'invalid-email', // Invalid email
        phone: '9876543210',
        address: {
          street: '123 Test St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '9876543211'
        }
      };

      const response = await request(app)
        .post('/api/patients/register-opd')
        .set('Authorization', `Bearer ${authToken}`)
        .send(patient);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });
}); 