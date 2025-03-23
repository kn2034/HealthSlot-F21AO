# HealthSlot Application Setup Guide

This guide provides comprehensive instructions for setting up and running the HealthSlot application in both development and production environments.

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- Git
- MongoDB (if running without Docker)
- npm or yarn

## 1. Initial Setup

### 1.1 Clone the Repository
```bash
git clone https://github.com/kn2034/HealthSlot-F21AO.git
cd HealthSlot-F21AO
```

### 1.2 Environment Setup
Create a `.env` file in the root directory:
```bash
# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# MongoDB
MONGODB_URI=mongodb://mongodb:27017/healthslot
MONGODB_URI_LOCAL=mongodb://localhost:27017/healthslot

# Logging
LOG_LEVEL=debug
```

## 2. Docker Setup

### 2.1 Docker Compose Configuration
Create or update `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/healthslot
    depends_on:
      - mongodb
    volumes:
      - ./logs:/app/logs
    networks:
      - healthslot-network

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - healthslot-network

networks:
  healthslot-network:
    driver: bridge

volumes:
  mongodb_data:
```

### 2.2 Dockerfile Configuration
Create or update `Dockerfile`:
```dockerfile
# Base image
FROM node:16-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

## 3. Running the Application

### 3.1 Using Docker (Recommended)
```bash
# Build and start containers
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f app
```

### 3.2 Without Docker (Development)
```bash
# Install dependencies
npm install

# Start MongoDB (if running locally)
mongod

# Run in development mode
npm run dev

# Run in production mode
npm run build
npm start
```

## 4. Database Setup

### 4.1 Initial Data Seeding
```bash
# Using Docker
docker-compose exec app npm run seed

# Without Docker
npm run seed
```

### 4.2 Database Backup and Restore
```bash
# Backup
docker-compose exec mongodb mongodump --out /data/backup

# Restore
docker-compose exec mongodb mongorestore /data/backup
```

## 5. Testing

### 5.1 Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Auth Tests"

# Run tests with coverage
npm run test:coverage
```

### 5.2 API Testing
Refer to `API_TESTING_GUIDE.md` for detailed API testing instructions.

## 6. Monitoring and Maintenance

### 6.1 Application Monitoring
```bash
# View Docker container status
docker-compose ps

# Monitor container resources
docker stats

# View application logs
docker-compose logs -f app
```

### 6.2 Database Monitoring
```bash
# Connect to MongoDB shell
docker-compose exec mongodb mongo

# Monitor database stats
db.stats()
```

## 7. Deployment

### 7.1 Production Deployment
```bash
# Build production image
docker build -t healthslot:prod .

# Push to registry (example with Docker Hub)
docker tag healthslot:prod username/healthslot:prod
docker push username/healthslot:prod
```

### 7.2 SSL Configuration
Update nginx configuration for SSL:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 8. Troubleshooting

### Common Issues and Solutions

1. **MongoDB Connection Issues**
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify network connectivity
docker network inspect healthslot-network
```

2. **Application Startup Issues**
```bash
# Check application logs
docker-compose logs app

# Verify environment variables
docker-compose exec app printenv
```

3. **Performance Issues**
```bash
# Monitor container resources
docker stats

# Check application metrics
curl http://localhost:3000/metrics
```

## 9. Development Workflow

### 9.1 Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking (if using TypeScript)
npm run type-check
```

### 9.2 Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push changes
git push origin feature/new-feature
```

## 10. Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use secrets management in production
   - Rotate JWT secrets regularly

2. **Docker Security**
   - Use non-root users in containers
   - Regularly update base images
   - Scan images for vulnerabilities

3. **API Security**
   - Implement rate limiting
   - Use HTTPS in production
   - Validate all inputs

## Notes

- Always backup data before major updates
- Keep dependencies updated
- Monitor system resources
- Follow security best practices
- Maintain proper documentation 