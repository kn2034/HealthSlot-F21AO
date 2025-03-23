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
          contactInfo: {
            email: "alice.johnson@email.com",
            phone: "9876543214",
            address: {
              street: "123 Main St",
              city: "Mumbai",
              state: "Maharashtra",
              pincode: "400001"
            }
          },
          emergencyContact: {
            name: "Bob Johnson",
            relationship: "Father",
            phone: "9876543215"
          },
          medicalInfo: {
            allergies: ["Penicillin"],
            currentMedications: ["None"],
            chronicConditions: ["None"],
            previousSurgeries: ["Appendectomy, 2015"]
          },
          appointmentInfo: {
            department: "General Medicine",
            preferredDoctor: "Dr. Smith",
            reasonForVisit: "Annual checkup",
            preferredTime: "Morning"
          }
        };

      });
    });
});