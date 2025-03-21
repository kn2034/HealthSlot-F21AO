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
        MONGODB_URI_DEV = credentials('mongodb-uri-dev')
        MONGODB_URI_STAGING = credentials('mongodb-uri-staging')
        MONGODB_URI_PROD = credentials('mongodb-uri-prod')
        JWT_SECRET = credentials('jwt-secret')
        STAGING_SERVER = credentials('staging-server')
        PRODUCTION_SERVER = credentials('production-server')
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
                    
                    // Login to Docker registry
                    withCredentials([string(credentialsId: 'docker-registry-token', variable: 'DOCKER_TOKEN')]) {
                        sh "echo ${DOCKER_TOKEN} | ${DOCKER_PATH} login ${DOCKER_REGISTRY} -u jenkins --password-stdin"
                    }
                    
                    // Push the Docker image
                    sh "${DOCKER_PATH} push ${imageFullName}"
                    sh "${DOCKER_PATH} push ${imageLatest}"
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
                    
                    // Copy deployment script to staging server
                    sshagent(['staging-ssh-key']) {
                        sh "scp scripts/deploy.sh ${STAGING_SERVER}:/tmp/deploy.sh"
                        
                        // Execute deployment script on staging server
                        sh "ssh ${STAGING_SERVER} 'bash /tmp/deploy.sh \"${imageFullName}\" \"${MONGODB_URI_STAGING}\" \"${JWT_SECRET}\"'"
                        
                        // Cleanup
                        sh "ssh ${STAGING_SERVER} 'rm /tmp/deploy.sh'"
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
                    
                    // Copy deployment script to production server
                    sshagent(['production-ssh-key']) {
                        sh "scp scripts/deploy.sh ${PRODUCTION_SERVER}:/tmp/deploy.sh"
                        
                        // Execute deployment script on production server
                        sh "ssh ${PRODUCTION_SERVER} 'bash /tmp/deploy.sh \"${imageFullName}\" \"${MONGODB_URI_PROD}\" \"${JWT_SECRET}\"'"
                        
                        // Cleanup
                        sh "ssh ${PRODUCTION_SERVER} 'rm /tmp/deploy.sh'"
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Clean workspace
            cleanWs()
            
            // Clean Docker images with full path
            catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                sh "${DOCKER_PATH} system prune -f"
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