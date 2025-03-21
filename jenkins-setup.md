# Jenkins Setup Guide

## Prerequisites

1. Jenkins Server Requirements:
   - Ubuntu 20.04 LTS or higher
   - 4GB RAM minimum
   - 20GB disk space
   - Java 11 or higher

2. Required Jenkins Plugins:
   - Docker Pipeline
   - Docker plugin
   - Git
   - JIRA
   - NodeJS
   - Pipeline
   - Blue Ocean
   - Credentials Binding

## Installation Steps

1. Install Jenkins:
```bash
# Add Jenkins repository
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'

# Update package list
sudo apt-get update

# Install Jenkins
sudo apt-get install jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

2. Initial Jenkins Setup:
   - Access Jenkins at `http://your-server:8080`
   - Get initial admin password:
     ```bash
     sudo cat /var/lib/jenkins/secrets/initialAdminPassword
     ```
   - Install suggested plugins
   - Create admin user

3. Configure Jenkins Tools:
   - Go to Manage Jenkins > Global Tool Configuration
   - Add NodeJS installation:
     - Name: NodeJS 18
     - Version: 18.x
     - Install automatically

4. Configure Credentials:
   - Go to Manage Jenkins > Credentials
   - Add credentials for:
     - Docker Hub (username/password)
     - JIRA (username/password)
     - Git (if using private repository)

5. Configure JIRA Integration:
   - Go to Manage Jenkins > Configure System
   - Add JIRA configuration:
     - JIRA URL
     - JIRA credentials
     - Project key: HEALTHSLOT

6. Configure Docker:
   - Add Jenkins user to docker group:
     ```bash
     sudo usermod -aG docker jenkins
     ```
   - Restart Jenkins:
     ```bash
     sudo systemctl restart jenkins
     ```

## Pipeline Configuration

1. Create New Pipeline:
   - Click "New Item"
   - Name: HealthSlot-Pipeline
   - Type: Pipeline
   - Click OK

2. Configure Pipeline:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: [Your Git Repository URL]
   - Branch Specifier: */develop
   - Script Path: Jenkinsfile
   - Save

3. Configure Webhooks:
   - In Git repository settings:
     - Add webhook URL: `http://your-jenkins-server:8080/github-webhook/`
     - Content type: application/json
     - Events: Just the push event

## JIRA Integration

1. Configure JIRA Project:
   - Create project: HEALTHSLOT
   - Issue types:
     - Bug
     - Task
     - Story
   - Workflow:
     - To Do
     - In Progress
     - In Review
     - Done
     - Failed

2. Branch Naming Convention:
   - Feature branches: feature/HEALTHSLOT-XXX
   - Bug fixes: bugfix/HEALTHSLOT-XXX
   - Hotfixes: hotfix/HEALTHSLOT-XXX

## Pipeline Stages

1. Checkout:
   - Clones repository
   - Extracts JIRA issue key from branch name

2. Install Dependencies:
   - Runs `npm ci`

3. Lint:
   - Runs `npm run lint`

4. Test:
   - Runs `npm test`
   - Archives test results

5. Build Docker Image:
   - Builds image with version tag
   - Pushes to Docker Hub

6. Deploy to Staging:
   - Deploys to staging environment
   - Runs on develop branch

7. Deploy to Production:
   - Deploys to production environment
   - Runs on main branch
   - Requires manual approval

8. Update JIRA:
   - Updates issue status
   - Adds build information

## Monitoring and Maintenance

1. Pipeline Logs:
   - Access through Jenkins UI
   - Blue Ocean for visual pipeline view
   - Archive artifacts for test results

2. Health Checks:
   - Application health endpoint
   - MongoDB connection
   - Container status

3. Backup:
   - Jenkins configuration
   - Pipeline history
   - Build artifacts

## Troubleshooting

1. Common Issues:
   - Docker permission issues
   - NodeJS version conflicts
   - JIRA API errors
   - Git webhook failures

2. Solutions:
   - Check Jenkins logs
   - Verify credentials
   - Restart Jenkins service
   - Check Docker daemon status

## Security Considerations

1. Access Control:
   - Role-based access
   - Pipeline permissions
   - Credential management

2. Network Security:
   - Firewall rules
   - SSL/TLS configuration
   - Internal network isolation

3. Container Security:
   - Non-root users
   - Image scanning
   - Regular updates 