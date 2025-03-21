# HealthSlot - Hospital Management System

A comprehensive hospital management system for managing patients, wards, admissions, and more.

## Features

- User authentication and role-based access control
- Patient management (registration, retrieval, updating)
- OPD and A&E patient registration
- Ward management
- RESTful API with Swagger documentation

## Recent Improvements

- Added complete ward management functionality with CRUD operations
- Removed deprecated Docker Compose version attribute
- Added comprehensive API tests using Jest and Supertest
- Implemented enhanced CI/CD pipeline with Jenkins
- Added multi-stage Docker builds for optimized production images
- Created deployment script for reliable and consistent deployments
- Implemented security best practices in Docker containers

## Technical Stack

- Node.js + Express.js backend
- MongoDB database
- Docker and Docker Compose for containerization
- JWT authentication
- Swagger for API documentation
- Jenkins for CI/CD pipeline

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/HealthSlot-F21AO.git
   cd HealthSlot-F21AO
   ```

2. Start the application using Docker:
   ```
   docker compose up
   ```

3. Access the API documentation:
   ```
   http://localhost:3001/api-docs
   ```

### Development

1. Install dependencies:
   ```
   npm install
   ```

2. Run in development mode:
   ```
   npm run dev
   ```

### Testing

Run the test suite:
```
npm test
```

Run linting:
```
npm run lint
```

## CI/CD Pipeline

The HealthSlot application uses a comprehensive Jenkins CI/CD pipeline for automated building, testing, and deployment. Our pipeline includes:

- Multi-stage Docker builds for optimized production images
- Automated testing with Jest and Supertest
- Linting with ESLint to ensure code quality
- Secure deployment to staging and production environments
- Continuous integration on every code push

The CI/CD pipeline includes the following stages:
1. **Setup**: Installing dependencies
2. **Lint**: Code quality checks
3. **Test**: Running automated tests
4. **QA**: Additional quality assurance checks and security audits
5. **Build**: Building optimized Docker images
6. **Deploy to Staging**: Automated deployment to staging
7. **Deploy to Production**: Manual approval followed by deployment

### Branch-Specific Behavior

The pipeline is configured to handle different branches in specific ways:

- **qa branch**: Triggers full pipeline up to staging deployment (for testing)
- **develop branch**: Triggers full pipeline up to staging deployment (for integration)
- **main branch**: Triggers full pipeline including production deployment (with manual approval)

Changes pushed to these branches will automatically trigger the Jenkins pipeline, which will execute the appropriate stages based on the branch.

For detailed setup instructions, see the [jenkins-setup.md](jenkins-setup.md) file.

### Security Features

Our CI/CD pipeline includes several security features:
- Multi-stage Docker builds to minimize image size
- Non-root user execution in containers
- Credentials management for sensitive information
- Manual approval for production deployments
- Automated clean-up of old Docker images

## API Endpoints

The API includes the following main endpoints:

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`
- **Patients**: `/api/patients`
- **Wards**: `/api/wards`

For detailed API documentation, access the Swagger UI at http://localhost:3001/api-docs when the application is running.

## Docker & Jenkins Setup

### Docker Setup

This project uses Docker for containerization. The application is containerized using a multi-stage build process for optimal image size and security.

#### Docker Components:
- **Dockerfile**: Multi-stage build that creates a production-ready image
- **docker-compose.production.yml**: Docker Compose configuration for production environment
- **docker-compose.staging.yml**: Docker Compose configuration for staging environment

### Jenkins Setup (Docker-only)

Follow these steps to set up Jenkins with Docker focus:

1. **Install Jenkins**
   - Follow installation instructions for your OS from [Jenkins.io](https://www.jenkins.io/doc/book/installing/)
   - Make sure Docker is installed on the Jenkins server

2. **Configure Jenkins**
   - Install Docker plugin in Jenkins (Manage Jenkins → Plugins → Available → "Docker")
   - Install Docker Pipeline plugin (Manage Jenkins → Plugins → Available → "Docker Pipeline")

3. **Create Jenkins Pipeline Job**
   - Create a new Pipeline job in Jenkins (New Item → Pipeline)
   - Configure SCM to point to your Git repository
   - Set the branch specifier to the branch you want to monitor (e.g., */qa)
   - Set the script path to "Jenkinsfile"

4. **Run the Pipeline**
   - The pipeline will:
     - Build the Docker image
     - Run a test container
     - Clean up resources when done

### Manual Docker Commands

You can also run Docker commands manually:

```bash
# Build the Docker image
docker build -t healthslot:latest .

# Run the container
docker run -d -p 3000:3000 --name healthslot-app healthslot:latest

# Check container logs
docker logs healthslot-app

# Stop the container
docker stop healthslot-app
```

## Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd HealthSlot-F21AO
```

2. Create `.env` file:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

3. Start the application:
```bash
docker compose up -d
```

4. Access the application:
- API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

## Docker Setup

For detailed Docker setup instructions, see [DOCKER.md](DOCKER.md)

### Quick Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild after changes
docker compose up -d --build
```

### Docker Image

The application image is available on Docker Hub:
```bash
docker pull kirananarayanak/healthslot-app:latest
```

For more information about:
- Detailed setup instructions
- Environment configuration
- Troubleshooting
- Development workflow

Please refer to [DOCKER.md](DOCKER.md)

## License

[Include your license information here]

## Contributors

[Include contributors here]# Test
