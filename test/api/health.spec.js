const request = require('supertest');
const app = require('../../app');

describe('Health Check API', () => {
  describe('GET /api/health', () => {
    it('should return 200 and healthy status', async () => {
      const response = await request(app)
        .get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });
});