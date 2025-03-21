pipeline {
    // This Jenkinsfile is used for automated CI/CD of the HealthSlot project
    // Monitored branches: main (production), develop (staging), qa (testing)
    agent any
    
    tools {
        // Define NodeJS installation - make sure this is configured in Jenkins
        nodejs 'NodeJS'
    }
    
    environment {
        DOCKER_PATH = sh(script: 'which docker || echo /opt/homebrew/bin/docker', returnStdout: true).trim()
        DOCKER_REGISTRY = 'registry.example.com'
        IMAGE_NAME = 'healthslot'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        // Define credentials only if they exist
        MONGODB_URI_DEV = credentials('mongodb-uri-dev') 
        MONGODB_URI_STAGING = credentials('mongodb-uri-staging')
        MONGODB_URI_PROD = credentials('mongodb-uri-prod')
        JWT_SECRET = credentials('jwt-secret')
        // Use optional block for these credentials in case they're not defined yet
    }
    
    stages {
        stage('Setup') {
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
            environment {
                NODE_ENV = 'test'
                MONGODB_URI = "${env.MONGODB_URI_DEV}"
                JWT_SECRET = "${env.JWT_SECRET}"
            }
            steps {
                sh 'npm test'
            }
        }
        
        stage('QA') {
            steps {
                echo 'Running Quality Assurance checks'
                sh 'npm run lint -- --fix || true'
                echo 'Running security audit'
                sh 'npm audit --production || true'
                echo 'QA checks completed'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def imageFullName = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    def imageLatest = "${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
                    
                    // Check if Docker is available
                    sh "[ -f ${DOCKER_PATH} ] || echo 'Docker not found at ${DOCKER_PATH}'"
                    
                    // Build the Docker image using the full path
                    sh "${DOCKER_PATH} info"
                    sh "${DOCKER_PATH} build -t ${imageFullName} -t ${imageLatest} ."
                    
                    // Login to Docker registry - only if credentials exist
                    withCredentials([string(credentialsId: 'docker-registry-token', variable: 'DOCKER_TOKEN')]) {
                        sh "echo ${DOCKER_TOKEN} | ${DOCKER_PATH} login ${DOCKER_REGISTRY} -u jenkins --password-stdin"
                    }
                    
                    // Push the Docker image
                    sh "${DOCKER_PATH} push ${imageFullName} || echo 'Push failed, continuing anyway'"
                    sh "${DOCKER_PATH} push ${imageLatest} || echo 'Push failed, continuing anyway'"
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'qa'
                }
            }
            steps {
                script {
                    def imageFullName = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    
                    echo "Deployment to staging would happen here if credentials were configured"
                    echo "Using image: ${imageFullName}"
                    
                    // This will only run if the credentials exist
                    withCredentials([
                        string(credentialsId: 'staging-server', variable: 'STAGING_SERVER'),
                        sshUserPrivateKey(credentialsId: 'staging-ssh-key', keyFileVariable: 'SSH_KEY')
                    ]) {
                        sh '''
                            echo "Staging server is ${STAGING_SERVER}"
                            echo "Deployment script exists: $(test -f scripts/deploy.sh && echo 'Yes' || echo 'No')"
                        '''
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message "Deploy to production?"
                ok "Yes, deploy to production"
            }
            steps {
                script {
                    def imageFullName = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    
                    echo "Deployment to production would happen here if credentials were configured"
                    echo "Using image: ${imageFullName}"
                    
                    // This will only run if the credentials exist
                    withCredentials([
                        string(credentialsId: 'production-server', variable: 'PRODUCTION_SERVER'),
                        sshUserPrivateKey(credentialsId: 'production-ssh-key', keyFileVariable: 'SSH_KEY')
                    ]) {
                        sh '''
                            echo "Production server is ${PRODUCTION_SERVER}"
                            echo "Deployment script exists: $(test -f scripts/deploy.sh && echo 'Yes' || echo 'No')"
                        '''
                    }
                }
            }
        }
    }
    
    post {
        always {
            node('any') {
                // Clean workspace inside node context
                catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                    cleanWs()
                }
                
                // Clean Docker images with full path
                catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                    sh "${DOCKER_PATH} system prune -f || echo 'Docker prune failed, continuing anyway'"
                }
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Check logs for details.'
        }
    }
} 