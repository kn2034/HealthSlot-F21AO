pipeline {
    agent any
    
    environment {
        DOCKER_PATH = sh(script: 'which docker || echo /usr/bin/docker', returnStdout: true).trim()
        IMAGE_NAME = 'healthslot'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    def imageLocal = "${IMAGE_NAME}:${IMAGE_TAG}"
                    
                    echo "Building Docker image: ${imageLocal}"
                    sh "${DOCKER_PATH} build -t ${imageLocal} ."
                }
            }
        }
        
        stage('Test Container') {
            steps {
                script {
                    def imageLocal = "${IMAGE_NAME}:${IMAGE_TAG}"
                    
                    echo "Running container health check"
                    sh "${DOCKER_PATH} run --name test-container -d -p 3000:3000 ${imageLocal}"
                    sh "sleep 5" // Wait for container to start
                    sh "${DOCKER_PATH} ps -a" // List containers
                    sh "${DOCKER_PATH} stop test-container || true"
                    sh "${DOCKER_PATH} rm test-container || true"
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "Cleaning up Docker resources"
                sh "${DOCKER_PATH} system prune -f || echo 'Docker prune failed, continuing anyway'"
            }
        }
        success {
            echo 'Docker build and test completed successfully!'
        }
        failure {
            echo 'Docker build or test failed! Check logs for details.'
        }
    }
}