# 🏥 HealthSlot – Hospital Management System

A modern hospital management system designed to streamline patient care, ward management, and operations using cutting-edge technologies, secure APIs, and a robust CI/CD pipeline.

---
## jira pipeline tesrt
## 🚀 Key Features

### 🧍‍♂️ Patient Management
- OPD and A&E patient registration
- Comprehensive digital medical history
- Emergency and routine patient workflows

### 🛏️ Ward Management
- Real-time bed availability tracker
- Ward creation, updates, and transfers
- Ward specializations and occupancy metrics

### 🧪 Laboratory Management
- Lab test registration and result recording
- Automated test ID generation
- Test result history management

### 🔐 Security & Access Control
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Secure REST API endpoints

---

## ⚙️ Tech Stack

| Layer          | Technology                             |
|----------------|-----------------------------------------|
| Backend        | Node.js, Express.js                    |
| Database       | MongoDB (Mongoose ODM)                 |
| Authentication | JWT + Role-Based Access                |
| API Docs       | Swagger (OpenAPI)                      |
| Testing        | Jest, Mocha, Chai, Supertest           |
| CI/CD          | Jenkins, Docker, Kubernetes (Minikube) |
| Monitoring     | Prometheus (Planned), Custom Endpoints |
| Containerization | Docker & Docker Compose               |

---

## ⚡ Quick Start

### ✅ Prerequisites
- Node.js 16+
- Docker & Docker Compose
- MongoDB (if not using Docker)

---

### 🐳 Run with Docker (Recommended)

\`\`\`bash
git clone https://github.com/kn2034/HealthSlot-F21AO.git
cd HealthSlot-F21AO
docker-compose up --build
\`\`\`

🔗 Access:
- API Base: http://localhost:3000  
- API Docs: http://localhost:3001/api-docs

---

### 🖥️ Run Locally (Dev Mode)

\`\`\`bash
npm install
cp .env.example .env  # Then configure variables
mongod                # Start MongoDB locally
npm run dev
\`\`\`

---

## 🧪 Testing

We use both **Jest** and **Mocha + Chai** to provide flexibility for different test types.

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

3. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

4. Run the application:
   ```bash
   npm run dev
   ```

## 🔬 API Testing Guide

📘 [Read the API Testing Guide](API_TESTING_GUIDE.md)  
It includes:
- cURL examples for all endpoints
- Full flow: registration → admission → test → transfer

Swagger UI (auto-generated from code):  
📄 [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

---

## 🔄 CI/CD Pipeline (via Jenkins)

Our CI/CD workflow includes:

1. **Build & Test**
   - Dependency installs
   - Linting
   - Unit + Integration testing (Mocha & Jest)
   - Code coverage

2. **Security & Quality**
   - OWASP ZAP scan (automated)
   - Code quality thresholds
   - Lint & coverage checks

3. **Deployment**
   - Docker image builds & pushes
   - Auto-deploy to staging
   - Manual approval to production
   - Post-deploy health checks

---

## 🛡️ Security Features

- JWT authentication
- Role-based access control (RBAC)
- Input validation & sanitization
- HTTPS enforcement (production)
- Secure password hashing
- OWASP ZAP security scanning
- Rate limiting & error handling

---

## 📊 Monitoring & Health

- \`GET /api/health\` – Health check endpoint
- Resource usage monitoring via Prometheus (planned)
- Real-time logs via Docker & Jenkins pipeline

---

## 📌 API Endpoints

### 🛡️ Authentication
- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login and get JWT token
- `POST /api/auth/logout` – Logout user (invalidate token)

### 🧍 Patients
- `POST /api/patients/register-opd` – Register a new OPD patient
- `POST /api/patients/register-ae` – Register a new A&E patient

### 🏥 Admissions
- `POST /api/admissions/admit` – Admit a patient to a ward
- `GET /api/admissions/status/:admissionId` – Get admission status
- `PUT /api/admissions/discharge` – Discharge a patient

### 🔁 Transfers
- `PUT /api/transfers/transfer` – Transfer patient between wards

### 🧪 Lab Tests
- `POST /api/lab/test-registration` – Register a test for a patient
- `GET /api/lab/test-registrations` – View all test registrations
- `POST /api/lab/tests` – Create a new lab test type
- `GET /api/lab/tests` – Get all lab test types
- `GET /api/lab/tests/:id` – Get test type by ID

### 🧾 Lab Results
- `POST /api/lab/results` – Add lab test result
- `GET /api/lab/results` – View all lab results
- `GET /api/lab/results/:id` – View test result by ID

### ❤️ Health Check
- `GET /api/health` – Check server health and uptime

### 🛏️ Wards
- `POST /api/wards` – Create a new hospital ward  
- `GET /api/wards` – Get all wards  

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

MIT License – See the [LICENSE](LICENSE) file.

---

## 👥 Contributors
- Gagan Lokanath Shetty(https://github.com/gagan-L)
- Harshitha Srikanth(https://github.com/hs2121-hw)
- Kiran Narayana(https://github.com/kirannarayanak)
- Sanjana Koujalgi(https://github.com/sk2235)

---

## 🆘 Support

For support and queries, please [open an issue](https://github.com/kn2034/HealthSlot-F21AO/issues) or contact the maintainers.

## 🔄 CI/CD Pipeline
- Automated Jenkins pipeline
- Continuous Integration with GitHub
- Automated testing on every commit
- Security scanning with OWASP ZAP
- Automated deployment to staging
- Production deployment with approval

👉 [Open an issue](https://github.com/kn2034/HealthSlot-F21AO/issues) for bug reports or help
