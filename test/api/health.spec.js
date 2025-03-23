const { chai, expect, app } = require('../setup');

describe('Health Check API', () => {
  describe('GET /api/health', () => {
    it('should return 200 and healthy status', (done) => {
      chai.request(app)
        .get('/api/health')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('status').equal('healthy');
          expect(res.body).to.have.property('timestamp');
          expect(res.body).to.have.property('version');
          done();
        });
    });
  });
});