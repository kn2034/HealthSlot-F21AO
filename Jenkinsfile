// Webhook test 2 - Testing automatic trigger
// Webhook test - This comment is to verify GitHub webhook integration
pipeline {
    agent any
    
    triggers {
        githubPush()
    }
    
    environment {
        DOCKER_IMAGE = 'healthslot-app'
        DOCKER_TAG = 'latest'
        JIRA_PROJECT = 'HEALTHSLOT'
        NODE_VERSION = '18'
    }
    
    tools {
        nodejs 'NodeJS'
    }
    
    stages {
        stage('Checkout') {
            steps {
                nodejs(nodeJSInstallationName: 'NodeJS') {
                    script {
                        sh 'rm -rf node_modules package-lock.json'
                    }
                }
            }
        }
        
        stage('Security Scan') {
            when {
                expression {
                    return env.SNYK_TOKEN != null
                }
            }
            steps {
                script {
                    try {
                        withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN', optional: true)]) {
                            if (env.SNYK_TOKEN) {
                                sh '''
                                    npm install -g snyk
                                    snyk auth $SNYK_TOKEN
                                    snyk test || true
                                    snyk container test || true
                                '''
                            } else {
                                echo "Skipping Snyk security scan due to missing credentials"
                            }
                        }
                    } catch (err) {
                        echo "Error during security scan: ${err.message}"
                        // Continue pipeline even if security scan fails
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                nodejs(nodeJSInstallationName: 'NodeJS') {
                    script {
                        sh 'rm -rf node_modules package-lock.json'
                        sh 'npm install'
                    }
                }
            }
        }
        
        stage('Lint') {
            steps {
                nodejs(nodeJSInstallationName: 'NodeJS') {
                    sh 'npm run lint'
                }
            }
        }
        
        stage('Test') {
            steps {
                nodejs(nodeJSInstallationName: 'NodeJS') {
                    script {
                        try {
                            sh 'npm test'
                        } catch (err) {
                            echo "Test execution failed: ${err.message}"
                            error 'Test execution failed'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    
                    // Run Trivy scan if available
                    try {
                        sh "trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    } catch (err) {
                        echo "Trivy scan skipped: ${err.message}"
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                script {
                    // Load environment variables from .env.staging
                    def envFile = readFile('.env.staging').trim()
                    envFile.split('\n').each { line ->
                        def (key, value) = line.split('=')
                        if (key && value) {
                            env."${key}" = value
                        }
                    }
                    
                    // Enhanced cleanup
                    sh '''
                        # Stop all running containers that might conflict
                        docker ps -q --filter "name=healthslot-" | xargs -r docker stop
                        docker ps -aq --filter "name=healthslot-" | xargs -r docker rm -f
                        
                        # Remove all volumes
                        docker volume ls -q --filter "name=healthslot" | xargs -r docker volume rm
                        
                        # Remove network if exists
                        docker network rm healthslot-pipeline2_healthslot-network || true
                        
                        # Wait for resources to be freed
                        sleep 10
                        
                        # Start MongoDB first
                        docker-compose -f docker-compose.staging.yml up -d mongodb
                        echo "Waiting for MongoDB to be healthy..."
                        sleep 20
                        
                        # Start the application
                        docker-compose -f docker-compose.staging.yml up -d app
                        echo "Waiting for application to be ready..."
                        sleep 30
                        
                        # Show running containers
                        docker ps
                        
                        # Check application health with retries
                        MAX_RETRIES=5
                        RETRY_COUNT=0
                        
                        while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
                            if wget -q --spider http://localhost:3005/api/health; then
                                echo "Application is healthy"
                                exit 0
                            fi
                            
                            # Check container logs if health check fails
                            echo "Health check failed, checking container logs..."
                            docker logs healthslot-staging
                            
                            echo "Retrying in 10 seconds..."
                            RETRY_COUNT=$((RETRY_COUNT + 1))
                            sleep 10
                        done
                        
                        echo "Health check failed after $MAX_RETRIES attempts"
                        docker logs healthslot-staging
                        docker-compose -f docker-compose.staging.yml logs
                        exit 1
                    '''
                }
            }
        }
    }
    
    post {
        always {
            node('built-in') {
                script {
                    cleanWs()
                    archiveArtifacts artifacts: '**/coverage/**/*', allowEmptyArchive: true
                }
            }
        }
    }
}