#!/bin/bash
# Docker setup script for Jenkins

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker first."
    exit 1
fi

echo "Docker is installed at: $(which docker)"
echo "Docker version: $(docker --version)"

# Verify Docker is running
if ! docker info &> /dev/null; then
    echo "Docker daemon is not running. Please start Docker."
    exit 1
fi

echo "Docker daemon is running."

# Build the Docker image
echo "Building Docker image..."
docker build -t healthslot:latest .

# Test the Docker image
echo "Testing Docker image..."
docker run -d --name healthslot-test -p 3000:3000 healthslot:latest
sleep 5

# Check if container is running
if docker ps | grep healthslot-test; then
    echo "Container is running successfully."
else
    echo "Container failed to start."
    docker logs healthslot-test
    exit 1
fi

# Clean up
echo "Cleaning up..."
docker stop healthslot-test
docker rm healthslot-test

echo "Docker setup complete!"
echo "You can now use this image in your Jenkins pipeline." 