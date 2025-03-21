const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dbHandler = require('./setup');

let authToken;
let testUser;

beforeAll(async () => {
  await dbHandler.connect();

  // Create a test user
  testUser = await User.create({
    username: 'testdoctor',
    fullName: 'Test Doctor',
    email: 'test.doctor@example.com',
    password: 'password123',
    role: 'doctor',
    department: 'General Medicine'
  });

  // Generate a test token
  authToken = jwt.sign(
    { userId: testUser._id, role: testUser.role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

beforeEach(async () => {
  await dbHandler.clearDatabase();
  
  // Recreate the test user
  testUser = await User.create({
    username: 'testdoctor',
    fullName: 'Test Doctor',
    email: 'test.doctor@example.com',
    password: 'password123',
    role: 'doctor',
    department: 'General Medicine'
  });
  
  // Regenerate the token
  authToken = jwt.sign(
    { userId: testUser._id, role: testUser.role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
});

describe('Patient API Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthslot-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should create a new patient', async () => {
    const response = await request(app)
      .post('/api/patients')
      .send({
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        contact: '1234567890',
        address: '123 Main St'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
  });

  test('should get all patients', async () => {
    const response = await request(app)
      .get('/api/patients');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
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
      expect(duplicateResponse.body.message).toBe('Patient with this phone already exists');
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