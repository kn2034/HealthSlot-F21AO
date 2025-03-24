# HealthSlot - Hospital Management System

A comprehensive hospital management system built with modern technologies for efficient patient care, ward management, and hospital operations.

## 🌟 Key Features
//Test Jira Integartion
- **Patient Management**
  - OPD and A&E patient registration
  - Patient history tracking
  - Digital medical records
  
- **Ward Management**
  - Real-time bed availability tracking
  - Ward transfers and assignments
  - Specialized ward categorization
  
- **Laboratory Management**
  - Test registration and tracking
  - Results management
  - Automated test ID generation
  
- **Security & Access Control**
  - Role-based access control (RBAC)
  - JWT authentication
  - Secure API endpoints

## 🚀 Technical Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **CI/CD**: Jenkins Pipeline
- **Testing**: Jest & Supertest

## 📚 Documentation

- [Complete Setup Guide](SETUP_GUIDE.md) - Detailed instructions for setting up the application
- [API Testing Guide](API_TESTING_GUIDE.md) - Comprehensive guide for testing all endpoints
- [API Documentation](http://localhost:3001/api-docs) - Swagger UI (when application is running)

## 🔧 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js v16 or higher (for local development)
- MongoDB (if running without Docker)

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/kn2034/HealthSlot-F21AO.git
   cd HealthSlot-F21AO
   ```

2. Start the application:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - API: http://localhost:3000
   - API Documentation: http://localhost:3001/api-docs

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

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Auth Tests"

# Run with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 🔄 CI/CD Pipeline

Our Jenkins pipeline ensures code quality and automated deployments:

1. **Build & Test**
   - Dependency installation
   - Linting and code quality checks
   - Unit and integration tests
   - Test coverage reports

2. **Quality Gates**
   - Code coverage thresholds
   - Security vulnerability scanning
   - Performance benchmarks

3. **Deployment**
   - Multi-stage Docker builds
   - Automated staging deployment
   - Manual production deployment approval
   - Post-deployment health checks

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- HTTPS enforcement in production
- Secure password hashing
- Regular security updates

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Patients
- `POST /api/patients/register-opd` - Register OPD patient
- `POST /api/patients/register-ae` - Register A&E patient
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient details

### Wards
- `POST /api/wards` - Create new ward
- `GET /api/wards` - List all wards
- `PUT /api/wards/:id` - Update ward
- `DELETE /api/wards/:id` - Delete ward

### Lab Tests
- `POST /api/lab/test-registration` - Register new test
- `GET /api/lab/test-registrations` - List all tests
- `POST /api/lab/results` - Add test results

### Transfers
- `PUT /api/transfers/transfer` - Transfer patient between wards

## 📈 Monitoring

- Real-time application monitoring
- Performance metrics tracking
- Error logging and alerting
- Resource usage monitoring
- Database health checks
- Prometheus metrics integration
- Grafana dashboards for visualization
- Alert manager configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- [Your Name](https://github.com/yourusername)
- [Add other contributors]

## 📞 Support

For support and queries, please [open an issue](https://github.com/kn2034/HealthSlot-F21AO/issues) or contact the maintainers.
