const { chai, expect, app } = require('../setup');

describe('Health Check API', () => {
  describe('GET /api/health', () => {
    it('should return 200 and healthy status', function(done) {
      // Set a shorter timeout
      this.timeout(5000);
      
      chai.request(app)
        .get('/api/health')
        .end((err, res) => {
          try {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('status').equal('healthy');
            expect(res.body).to.have.property('timestamp');
            expect(res.body).to.have.property('version');
            done();
          } catch (error) {
            done(error);
          }
        });
    });
  });
});