const request = require('supertest');
const app = require('../../app');
const User = require('../models/User');

describe('Login API Tests', () => {
    beforeAll(async () => {
        // Create a test user
        await User.create({
            username: 'testuser',
            fullName: 'Test User',
            email: 'test@example.com',
            password: 'Test123!',
            role: 'admin',
            department: 'IT'
        });
    });

    afterAll(async () => {
        // Clean up test user
        await User.deleteMany({});
    });

    test('should successfully login with valid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'Test123!'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('token');
    });

    test('should fail with invalid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid credentials');
    });
}); 