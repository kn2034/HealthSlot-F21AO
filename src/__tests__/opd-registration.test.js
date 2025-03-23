const request = require('supertest');
const app = require('../app');

describe('OPD Patient Registration Tests', () => {
    describe('POST /api/patients/register-opd', () => {
      it('should pass dummy OPD registration test', async () => {
        const patientData = {
          personalInfo: {
            firstName: "Alice",
            lastName: "Johnson",
            dateOfBirth: "1992-03-15",
            gender: "Female",
            bloodGroup: "A+",
            maritalStatus: "Single"
          },

      });
    });
});