#!/bin/bash

# Ensure we're on the qa branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "qa" ]; then
    echo "Error: Must be on qa branch for QA deployment"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DOCKER_IMAGE" ] || [ -z "$DOCKER_TAG" ] || [ -z "$MONGODB_URI" ] || [ -z "$JWT_SECRET" ]; then
    echo "Error: Required environment variables are not set"
    echo "Please set: DOCKER_IMAGE, DOCKER_TAG, MONGODB_URI, JWT_SECRET"
    exit 1
fi

echo "Stopping and removing all containers..."
docker ps -aq | xargs -r docker stop
docker ps -aq | xargs -r docker rm -f

echo "Removing all volumes..."
docker volume ls -q | xargs -r docker volume rm -f

echo "Removing all networks..."
docker network ls --filter type=custom -q | xargs -r docker network rm

echo "Killing any process using port 8080..."
lsof -ti:8080 | xargs -r kill -9

echo "Waiting for cleanup to complete..."
sleep 5

echo "Starting deployment..."
docker-compose -f docker-compose.qa.yml up -d mongodb

echo "Waiting for MongoDB to be ready..."
sleep 20

echo "Starting application..."
docker-compose -f docker-compose.qa.yml up -d app

echo "Waiting for application to start..."
sleep 30

echo "Checking container status..."
docker ps -a

echo "Checking application logs..."
docker logs healthslot-qa

# Check if the application is healthy
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8080/api/health > /dev/null; then
        echo "Application is healthy!"
        exit 0
    fi
    echo "Health check failed, retrying in 10 seconds..."
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 10
done

echo "Application failed to become healthy after $MAX_RETRIES attempts"
exit 1 