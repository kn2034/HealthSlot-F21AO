const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { generateToken } = require('../utils/auth');

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthslot_test');
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect after all tests
    await mongoose.disconnect();
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test@123',
      fullName: 'Test User',
      role: 'doctor',
      department: 'Cardiology'
    };

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', validUser.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUser);

      // Attempt duplicate registration
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate password strength', async () => {
      const weakPasswordUser = {
        ...validUser,
        password: 'weak'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('password');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test@123',
          fullName: 'Test User',
          role: 'doctor',
          department: 'Cardiology'
        });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword@123'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@123'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;

    beforeEach(async () => {
      // Create and login a user before each logout test
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@123',
        fullName: 'Test User',
        role: 'doctor',
        department: 'Cardiology'
      });
      authToken = generateToken(user);
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should fail without auth token', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Token Validation', () => {
    let authToken;

    beforeEach(async () => {
      // Create a user and generate token
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@123',
        fullName: 'Test User',
        role: 'doctor',
        department: 'Cardiology'
      });
      authToken = generateToken(user);
    });

    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject expired token', async () => {
      // Create token that's already expired
      const expiredToken = generateToken({ _id: 'userid' }, '0s');
      
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
}); 