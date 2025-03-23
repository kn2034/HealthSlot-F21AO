# HealthSlot API Testing Guide

This guide provides step-by-step instructions for testing all endpoints in the HealthSlot application.

## Prerequisites
- The application should be running on `http://localhost:3000`
- You'll need a tool like cURL, Postman, or any API testing tool

## 1. Authentication Endpoints

### 1.1 Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "username": "adminuser",
  "email": "admin@healthslot.com",
  "password": "Admin@123",
  "fullName": "Admin User",
  "role": "admin",
  "department": "Administration"
}'
```

### 1.2 Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@healthslot.com",
  "password": "Admin@123"
}'
```
Save the token from the response for subsequent requests.

## 2. Ward Management

### 2.1 Create a New Ward
```bash
curl -X POST http://localhost:3000/api/wards \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "wardNumber": "A-101",
  "wardType": "General",
  "totalBeds": 20,
  "occupiedBeds": 0,
  "specialization": "General",
  "floor": 2
}'
```

### 2.2 Get All Wards
```bash
curl -X GET http://localhost:3000/api/wards \
-H "Authorization: Bearer YOUR_TOKEN"
```

## 3. Patient Registration

### 3.1 Register OPD Patient
```bash
curl -X POST http://localhost:3000/api/patients/register-opd \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "Male",
    "bloodGroup": "O+"
  },
  "contactInfo": {
    "email": "john.doe@example.com",
    "phone": "9999999999",
    "address": {
      "street": "123 Main St",
      "city": "London",
      "state": "Greater London"
    }
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "8888888888"
  }
}'
```

### 3.2 Register A&E Patient
```bash
curl -X POST http://localhost:3000/api/patients/register-ae \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "personalInfo": {
    "firstName": "Jane",
    "lastName": "Smith",
    "dateOfBirth": "1985-05-15",
    "gender": "Female",
    "bloodGroup": "A+"
  },
  "contactInfo": {
    "email": "jane.smith@example.com",
    "phone": "7777777777",
    "address": {
      "street": "456 High St",
      "city": "London",
      "state": "Greater London"
    }
  },
  "emergencyContact": {
    "name": "John Smith",
    "relationship": "Spouse",
    "phone": "6666666666"
  },
  "emergencyDetails": {
    "injuryType": "Trauma",
    "arrivalMode": "Ambulance",
    "chiefComplaint": "Severe chest pain"
  }
}'
```

## 4. Admissions

### 4.1 Admit Patient
```bash
curl -X POST http://localhost:3000/api/admissions/admit \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "patientId": "PATIENT_ID",
  "wardId": "WARD_ID",
  "bedNumber": 1,
  "admissionType": "Planned",
  "diagnosis": "General checkup",
  "expectedDischargeDate": "2025-03-30",
  "notes": "Routine admission",
  "admittingDoctor": "DOCTOR_ID"
}'
```

### 4.2 Get Admission Status
```bash
curl -X GET http://localhost:3000/api/admissions/status/ADMISSION_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

## 5. Lab Tests

### 5.1 Register a New Test
```bash
curl -X POST http://localhost:3000/api/lab/test-registration \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "patientId": "PATIENT_ID",
  "testType": "Blood Test",
  "priority": "Urgent",
  "notes": "Complete blood count needed",
  "scheduledDate": "2025-03-24T10:00:00.000Z"
}'
```

### 5.2 Get All Test Registrations
```bash
curl -X GET http://localhost:3000/api/lab/test-registrations \
-H "Authorization: Bearer YOUR_TOKEN"
```

### 5.3 Add Test Results
```bash
curl -X POST http://localhost:3000/api/lab/results \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "testRegistrationId": "TEST_REGISTRATION_ID",
  "result": "WBC: 7500/µL, RBC: 4.8 x10^12/L, HGB: 14.5 g/dL, PLT: 250000/µL",
  "status": "Completed",
  "performedBy": "TECHNICIAN_ID",
  "comments": "All values within normal range"
}'
```

## 6. Transfers

### 6.1 Transfer Patient
```bash
curl -X PUT http://localhost:3000/api/transfers/transfer \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "admissionId": "ADMISSION_ID",
  "newWardId": "NEW_WARD_ID",
  "newBedNumber": 1,
  "reason": "Transfer to private ward",
  "notes": "Patient requested private room"
}'
```

## Testing Flow

For a complete test of the system, follow these steps:

1. Register an admin user and get the token
2. Create a ward
3. Register an OPD patient
4. Register an A&E patient
5. Admit one of the patients
6. Register a lab test for the patient
7. Add test results
8. Create another ward
9. Transfer the patient to the new ward

## Response Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Notes

- Replace `YOUR_TOKEN` with the actual token received after login
- Replace IDs (PATIENT_ID, WARD_ID, etc.) with actual IDs from your system
- All requests requiring authentication must include the Authorization header
- Dates should be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ) 