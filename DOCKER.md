# Docker Setup Documentation

## Prerequisites

- Docker Desktop installed (version 20.10.0 or higher)
- Docker Compose v2.0.0 or higher
- Git
- Node.js v18 (for local development)

## Docker Registry Access

The application image is hosted on Docker Hub:
- Registry: docker.io
- Image: kirananarayanak/healthslot-app
- Latest tag: latest

To access the registry:

```bash
# Login to Docker Hub
docker login

# Pull the image
docker pull kirananarayanak/healthslot-app:latest
```

## Environment Variables Setup

1. Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
```

Replace the placeholder values with your actual configuration:
- `MONGODB_URI`: Your MongoDB connection string
- `MONGO_ROOT_USERNAME`: MongoDB root username
- `MONGO_ROOT_PASSWORD`: MongoDB root password
- `JWT_SECRET`: Secret key for JWT token generation

## Docker Compose Usage

### Starting the Application

1. Clone the repository:
```bash
git clone <repository-url>
cd HealthSlot-F21AO
```

2. Build and start the containers:
```bash
# Build and start in detached mode
docker compose up -d

# View logs
docker compose logs -f
```

### Managing Containers

```bash
# Stop the application
docker compose down

# Rebuild after changes
docker compose up -d --build

# View container status
docker compose ps

# View logs
docker compose logs app    # Application logs
docker compose logs mongodb # MongoDB logs
```

### Container Details

1. Application Container:
   - Name: healthslot-app
   - Port: 3000
   - Volumes:
     - `./src:/app/src` (source code)
     - `./logs:/app/logs` (application logs)

2. MongoDB Container:
   - Name: healthslot-mongodb
   - Port: 27017
   - Volume: mongodb_data (persistent storage)

## Building and Publishing Images

### Building the Image

```bash
# Build the image
docker build -t kirananarayanak/healthslot-app:latest .

# Test the build
docker run -d -p 3000:3000 --env-file .env kirananarayanak/healthslot-app:latest
```

### Publishing to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push the image
docker push kirananarayanak/healthslot-app:latest
```

## Troubleshooting

1. If MongoDB connection fails:
   - Check if MongoDB container is running: `docker compose ps`
   - Verify environment variables in `.env`
   - Check MongoDB logs: `docker compose logs mongodb`

2. If application fails to start:
   - Check application logs: `docker compose logs app`
   - Verify all environment variables are set correctly
   - Ensure ports are not in use by other services

3. Common Issues:
   - Port 3000 already in use: Change the port mapping in docker-compose.yml
   - MongoDB authentication failed: Verify credentials in .env file
   - Container not starting: Check docker-compose logs for errors

## Security Notes

1. Environment Variables:
   - Never commit `.env` file to version control
   - Use secure passwords for MongoDB
   - Regularly rotate JWT secrets

2. Container Security:
   - Keep base images updated
   - Run containers with non-root users
   - Regularly update dependencies

## Development Workflow

1. Local Development:
```bash
# Start services in development mode
docker compose up -d

# View real-time logs
docker compose logs -f
```

2. Making Changes:
```bash
# Rebuild after code changes
docker compose up -d --build

# Restart specific service
docker compose restart app
```

3. Cleanup:
```bash
# Remove containers and networks
docker compose down

# Remove containers, networks, and volumes
docker compose down -v
``` 