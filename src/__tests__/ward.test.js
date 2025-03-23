const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Ward = require('../models/Ward');
const User = require('../models/User');
const { generateToken } = require('../utils/auth');

describe('Ward Management Tests', () => {
  let adminToken;
  let doctorToken;
  let nurseToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthslot_test');

    // Create test users with different roles
    const admin = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      password: 'Admin@123',
      fullName: 'Admin User',
      role: 'admin',
      department: 'Administration'
    });

    const doctor = await User.create({
      username: 'doctor',
      email: 'doctor@test.com',
      password: 'Doctor@123',
      fullName: 'Doctor User',
      role: 'doctor',
      department: 'General'
    });

    const nurse = await User.create({
      username: 'nurse',
      email: 'nurse@test.com',
      password: 'Nurse@123',
      fullName: 'Nurse User',
      role: 'nurse',
      department: 'General'
    });

    adminToken = generateToken(admin);
    doctorToken = generateToken(doctor);
    nurseToken = generateToken(nurse);
  });

  beforeEach(async () => {
    // Clear wards collection before each test
    await Ward.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect after all tests
    await mongoose.disconnect();
  });

  describe('POST /api/wards', () => {
    const validWard = {
      wardNumber: 'A-101',
      wardType: 'General',
      totalBeds: 20,
      occupiedBeds: 0,
      specialization: 'General Medicine',
      floor: 1
    };

    it('should create a new ward when admin requests', async () => {
      const res = await request(app)
        .post('/api/wards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validWard);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('wardNumber', validWard.wardNumber);
      expect(res.body).toHaveProperty('totalBeds', validWard.totalBeds);
    });

    it('should not allow ward creation for non-admin users', async () => {
      const res = await request(app)
        .post('/api/wards')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(validWard);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/wards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          wardNumber: 'A-101',
          wardType: 'General'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should not create ward with duplicate ward number', async () => {
      // First ward creation
      await request(app)
        .post('/api/wards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validWard);

      // Attempt duplicate creation
      const res = await request(app)
        .post('/api/wards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validWard);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/wards', () => {
    beforeEach(async () => {
      // Create test wards
      await Ward.create([
        {
          wardNumber: 'A-101',
          wardType: 'General',
          totalBeds: 20,
          occupiedBeds: 5,
          specialization: 'General Medicine',
          floor: 1
        },
        {
          wardNumber: 'B-201',
          wardType: 'Special',
          totalBeds: 10,
          occupiedBeds: 2,
          specialization: 'Cardiology',
          floor: 2
        }
      ]);
    });

    it('should list all wards for authenticated users', async () => {
      const res = await request(app)
        .get('/api/wards')
        .set('Authorization', `Bearer ${nurseToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body).toHaveLength(2);
    });

    it('should return ward details with correct structure', async () => {
      const res = await request(app)
        .get('/api/wards')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.body[0]).toHaveProperty('wardNumber');
      expect(res.body[0]).toHaveProperty('totalBeds');
      expect(res.body[0]).toHaveProperty('occupiedBeds');
      expect(res.body[0]).toHaveProperty('availableBeds');
    });

    it('should not allow access without authentication', async () => {
      const res = await request(app)
        .get('/api/wards');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/wards/:id', () => {
    let wardId;

    beforeEach(async () => {
      // Create a test ward
      const ward = await Ward.create({
        wardNumber: 'A-101',
        wardType: 'General',
        totalBeds: 20,
        occupiedBeds: 5,
        specialization: 'General Medicine',
        floor: 1
      });
      wardId = ward._id;
    });

    it('should update ward details when admin requests', async () => {
      const updateData = {
        totalBeds: 25,
        specialization: 'Internal Medicine'
      };

      const res = await request(app)
        .put(`/api/wards/${wardId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalBeds', 25);
      expect(res.body).toHaveProperty('specialization', 'Internal Medicine');
    });

    it('should not allow updates from non-admin users', async () => {
      const res = await request(app)
        .put(`/api/wards/${wardId}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({ totalBeds: 25 });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate bed capacity changes', async () => {
      const res = await request(app)
        .put(`/api/wards/${wardId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ totalBeds: 3 }); // Less than occupied beds

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/wards/:id', () => {
    let wardId;

    beforeEach(async () => {
      // Create a test ward
      const ward = await Ward.create({
        wardNumber: 'A-101',
        wardType: 'General',
        totalBeds: 20,
        occupiedBeds: 0,
        specialization: 'General Medicine',
        floor: 1
      });
      wardId = ward._id;
    });

    it('should delete empty ward when admin requests', async () => {
      const res = await request(app)
        .delete(`/api/wards/${wardId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Verify ward is deleted
      const ward = await Ward.findById(wardId);
      expect(ward).toBeNull();
    });

    it('should not delete ward with occupied beds', async () => {
      // Update ward to have occupied beds
      await Ward.findByIdAndUpdate(wardId, { occupiedBeds: 5 });

      const res = await request(app)
        .delete(`/api/wards/${wardId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should not allow deletion by non-admin users', async () => {
      const res = await request(app)
        .delete(`/api/wards/${wardId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });
  });
}); 