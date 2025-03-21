pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'kirananarayanak/healthslot-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        JIRA_PROJECT = 'HEALTHSLOT'
        NODE_VERSION = '18'
    }
    
    tools {
        nodejs 'NodeJS 18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // Get JIRA issue key from branch name
                    def branchName = env.BRANCH_NAME
                    def matcher = branchName =~ /(HEALTHSLOT-\d+)/
                    if (matcher) {
                        env.JIRA_ISSUE_KEY = matcher[0][1]
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
                // Archive test results
                archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Verify Dockerfile exists
                    if (!fileExists('Dockerfile')) {
                        error 'Dockerfile not found in workspace'
                    }
                    
                    // Build Docker image
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker build -t ${DOCKER_IMAGE}:latest .
                    """
                    
                    // Push to Docker Hub
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', 
                                                   usernameVariable: 'DOCKER_USERNAME', 
                                                   passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh """
                            docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                            docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker push ${DOCKER_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Test Container') {
            steps {
                script {
                    sh """
                        docker run --name test-container -d -p 3000:3000 ${DOCKER_IMAGE}:${DOCKER_TAG}
                        sleep 5
                        docker ps -a
                        docker stop test-container || true
                        docker rm test-container || true
                    """
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    // Verify docker-compose file exists
                    if (!fileExists('docker-compose.staging.yml')) {
                        error 'docker-compose.staging.yml not found in workspace'
                    }
                    
                    // Deploy to staging environment
                    sh """
                        docker-compose -f docker-compose.staging.yml pull
                        docker-compose -f docker-compose.staging.yml up -d
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Verify docker-compose file exists
                    if (!fileExists('docker-compose.production.yml')) {
                        error 'docker-compose.production.yml not found in workspace'
                    }
                    
                    // Deploy to production environment
                    sh """
                        docker-compose -f docker-compose.production.yml pull
                        docker-compose -f docker-compose.production.yml up -d
                    """
                }
            }
        }
        
        stage('Update JIRA') {
            steps {
                script {
                    if (env.JIRA_ISSUE_KEY) {
                        // Update JIRA issue with build information
                        def jiraComment = """
                            Build ${BUILD_NUMBER} completed successfully
                            Status: ${currentBuild.result}
                            Duration: ${currentBuild.durationString}
                            Changes: ${currentBuild.changeSets}
                        """
                        
                        // Use JIRA REST API to update the issue
                        def response = httpRequest(
                            url: "${JIRA_URL}/rest/api/2/issue/${env.JIRA_ISSUE_KEY}/comment",
                            httpMode: 'POST',
                            contentType: 'APPLICATION_JSON',
                            headers: [
                                [name: 'Authorization', value: "Basic ${JIRA_CREDENTIALS}"],
                                [name: 'Content-Type', value: 'application/json']
                            ],
                            requestBody: """
                                {
                                    "body": "${jiraComment}"
                                }
                            """
                        )
                        
                        if (response.status != 201) {
                            error "Failed to update JIRA issue: ${response.content}"
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            script {
                if (env.JIRA_ISSUE_KEY) {
                    // Update JIRA issue status to "Done" if deployment was successful
                    def response = httpRequest(
                        url: "${JIRA_URL}/rest/api/2/issue/${env.JIRA_ISSUE_KEY}/transitions",
                        httpMode: 'POST',
                        contentType: 'APPLICATION_JSON',
                        headers: [
                            [name: 'Authorization', value: "Basic ${JIRA_CREDENTIALS}"],
                            [name: 'Content-Type', value: 'application/json']
                        ],
                        requestBody: """
                            {
                                "transition": {
                                    "id": "31"
                                }
                            }
                        """
                    )
                }
            }
        }
        failure {
            script {
                if (env.JIRA_ISSUE_KEY) {
                    // Update JIRA issue status to "Failed" if deployment failed
                    def response = httpRequest(
                        url: "${JIRA_URL}/rest/api/2/issue/${env.JIRA_ISSUE_KEY}/transitions",
                        httpMode: 'POST',
                        contentType: 'APPLICATION_JSON',
                        headers: [
                            [name: 'Authorization', value: "Basic ${JIRA_CREDENTIALS}"],
                            [name: 'Content-Type', value: 'application/json']
                        ],
                        requestBody: """
                            {
                                "transition": {
                                    "id": "41"
                                }
                            }
                        """
                    )
                }
            }
        }
    }
}