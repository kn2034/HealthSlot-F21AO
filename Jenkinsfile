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
                        # Stop and remove any existing containers with these names
                        docker-compose -f docker-compose.staging.yml down -v || true
                        docker rm -f healthslot-staging healthslot-mongodb-staging || true
                        
                        # Remove volumes
                        docker volume rm healthslot-pipeline2_mongodb_staging_data || true
                        
                        # Kill any process using the staging port
                        PORT=$(grep "^PORT=" .env.staging | cut -d '=' -f2)
                        lsof -ti :$PORT | xargs kill -9 || true
                        
                        # Wait for port to be available
                        sleep 5
                    '''
                    
                    // Deploy using docker-compose with health check
                    sh '''
                        # Start the services
                        docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
                        
                        # Wait for services to be healthy
                        echo "Waiting for services to be healthy..."
                        sleep 15
                        
                        # Check container status
                        if ! docker ps | grep -q "healthslot-staging"; then
                            echo "Staging container failed to start"
                            docker logs healthslot-staging
                            exit 1
                        fi
                        
                        if ! docker ps | grep -q "healthslot-mongodb-staging"; then
                            echo "MongoDB container failed to start"
                            docker logs healthslot-mongodb-staging
                            exit 1
                        fi
                        
                        # Show running containers
                        docker ps
                        
                        # Check application health
                        PORT=$(grep "^PORT=" .env.staging | cut -d '=' -f2)
                        curl -f http://localhost:$PORT/api/health || (echo "Health check failed" && exit 1)
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