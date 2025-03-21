// Webhook test 2 - Testing automatic trigger
// Webhook test - This comment is to verify GitHub webhook integration
pipeline {
    agent any
    
    triggers {
        githubPush()
    }
    
    environment {
        DOCKER_IMAGE = 'kirananarayanak/healthslot-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        JIRA_PROJECT = 'HEALTHSLOT'
        NODE_VERSION = '18'
        SNYK_TOKEN = credentials('snyk-token')
    }
    
    tools {
        nodejs 'NodeJS'
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
        
        stage('Security Scan') {
            steps {
                script {
                    // Install and run Snyk for dependency vulnerability scanning
                    sh 'npm install -g snyk'
                    sh 'snyk auth ${SNYK_TOKEN}'
                    sh 'snyk test || true'
                    sh 'snyk container test ${DOCKER_IMAGE}:${DOCKER_TAG} || true'
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
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm test'
                        junit 'coverage/junit.xml'
                        publishHTML([
                            allowMissing: false,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'coverage/lcov-report',
                            reportFiles: 'index.html',
                            reportName: 'Coverage Report'
                        ])
                    }
                }
                stage('Integration Tests') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    if (!fileExists('Dockerfile')) {
                        error 'Dockerfile not found in workspace'
                    }
                    
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker build -t ${DOCKER_IMAGE}:latest .
                    """
                    
                    // Run Trivy container security scan
                    sh """
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                    
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
                        docker rm -f test-container || true
                        docker run --name test-container -d -p 3001:3000 \
                            -e MONGODB_URI=mongodb://localhost:27017/healthslot-test \
                            -e NODE_ENV=test \
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                        sleep 5
                        docker ps -a
                        docker logs test-container
                        
                        # Health check
                        curl -f http://localhost:3001/health || exit 1
                        
                        # Performance test using Apache Benchmark
                        ab -n 100 -c 10 http://localhost:3001/health
                        
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
                    if (!fileExists('docker-compose.staging.yml')) {
                        error 'docker-compose.staging.yml not found in workspace'
                    }
                    
                    sh """
                        docker-compose -f docker-compose.staging.yml pull
                        docker-compose -f docker-compose.staging.yml up -d
                        
                        # Setup monitoring
                        docker run -d --name prometheus \
                            -v ./prometheus.yml:/etc/prometheus/prometheus.yml \
                            prom/prometheus
                            
                        docker run -d --name grafana \
                            -p 3000:3000 \
                            grafana/grafana
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
            cleanWs()
            // Archive logs
            archiveArtifacts artifacts: 'logs/**/*.log', allowEmptyArchive: true
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