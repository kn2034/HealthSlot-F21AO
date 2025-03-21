# Jenkins Docker Setup Guide

This guide provides detailed instructions for setting up Jenkins with a focus on Docker for the HealthSlot project.

## Prerequisites

- Docker installed on your Jenkins server
- Git installed
- Jenkins installed (v2.346.x or later recommended)

## Jenkins Installation

If you haven't installed Jenkins yet:

1. For macOS:
   ```bash
   brew install jenkins-lts
   ```

2. For Ubuntu/Debian:
   ```bash
   wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
   sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
   sudo apt-get update
   sudo apt-get install jenkins
   ```

3. For other systems, follow the [official Jenkins installation guide](https://www.jenkins.io/doc/book/installing/).

## Jenkins Configuration for Docker

1. **Install Required Plugins**:
   - Go to "Manage Jenkins" > "Manage Plugins"
   - Go to the "Available" tab
   - Search for and install the following plugins:
     - Docker plugin
     - Docker Pipeline
     - Git
     - Pipeline

2. **Configure Docker in Jenkins**:
   - Go to "Manage Jenkins" > "Global Tool Configuration"
   - Find "Docker" section
   - Add Docker installation:
     - Name: "Docker"
     - Installation method: "Install automatically" or point to your Docker installation

3. **Configure Docker Registry (Optional)**:
   - Go to "Manage Jenkins" > "Manage Credentials"
   - Add credentials for your Docker registry if needed

## Creating a Jenkins Pipeline Job

1. **Create a New Pipeline Job**:
   - Click "New Item" on the Jenkins dashboard
   - Enter a name for your job (e.g., "HealthSlot-Docker")
   - Select "Pipeline" and click "OK"

2. **Configure the Pipeline**:
   - In the "Pipeline" section:
     - Select "Pipeline script from SCM"
     - Select "Git" as SCM
     - Enter your repository URL
     - Specify branch (e.g., "*/qa")
     - Script Path: "Jenkinsfile"
   - Save the configuration

## Running the Pipeline

1. Click "Build Now" to run the pipeline manually
2. The pipeline will:
   - Build the Docker image
   - Run a test container
   - Clean up Docker resources

## Troubleshooting

### Common Issues:

1. **Docker Not Found**:
   - Ensure Docker is installed on the Jenkins server
   - Verify Jenkins has permissions to execute Docker commands
   - Solution: Add Jenkins user to the docker group:
     ```bash
     sudo usermod -aG docker jenkins
     sudo systemctl restart jenkins
     ```

2. **Docker Registry Authentication Issues**:
   - Verify credentials are correctly set up in Jenkins
   - Check Docker login command in the Jenkinsfile

3. **Pipeline Failures**:
   - Check console output for detailed error messages
   - Verify Dockerfile syntax
   - Test Docker build locally using `scripts/docker-setup.sh`

## Advanced Configuration

### Setting Up Webhook Triggers:

1. For GitHub:
   - Go to your GitHub repository > Settings > Webhooks
   - Add webhook with URL: `http://your-jenkins-url/github-webhook/`
   - Select "Just the push event"

2. For other SCM providers, consult their specific webhook setup instructions

### Setting Up Docker Compose:

If you're using Docker Compose in your pipeline:

1. Ensure Docker Compose is installed on the Jenkins server
2. Add appropriate steps in your Jenkinsfile to use Docker Compose

## Maintenance

- Regularly update Jenkins and plugins
- Prune old Docker images and containers
- Monitor disk space on the Jenkins server

## Resources

- [Jenkins Docker Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/docker/)
- [Docker Documentation](https://docs.docker.com/)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/) 