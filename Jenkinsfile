pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'healthslot-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        KUBERNETES_NAMESPACE = 'healthslot'
        JIRA_PROJECT_KEY = 'HEALTH'
        DOCKER_REGISTRY = 'docker.io'  // Replace with your registry
        DOCKER_CREDENTIALS = 'docker-cred-id'  // Replace with your credentials ID
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Code Quality') {
            steps {
                sh 'npm run lint'
                sh 'npm audit'
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    // OWASP Dependency Check
                    sh 'npm audit'
                    
                    // OWASP ZAP Scan
                    sh '''
                        docker run -t owasp/zap2docker-stable zap-baseline.py \
                        -t http://localhost:3000 \
                        -r zap-report.html
                    '''
                    
                    // Container Scan
                    sh '''
                        docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }
        
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS) {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Apply Kubernetes configurations
                    sh """
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/deployment.yaml -n ${KUBERNETES_NAMESPACE}
                        kubectl apply -f k8s/service.yaml -n ${KUBERNETES_NAMESPACE}
                        kubectl apply -f k8s/ingress.yaml -n ${KUBERNETES_NAMESPACE}
                    """
                    
                    // Update deployment with new image
                    sh """
                        kubectl set image deployment/healthslot-app \
                        healthslot-app=${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} \
                        -n ${KUBERNETES_NAMESPACE}
                    """
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    sh """
                        kubectl rollout status deployment/healthslot-app -n ${KUBERNETES_NAMESPACE}
                        kubectl get pods -n ${KUBERNETES_NAMESPACE}
                    """
                }
            }
        }
        
        stage('Setup Monitoring') {
            steps {
                script {
                    sh """
                        kubectl apply -f monitoring/prometheus-config.yaml -n ${KUBERNETES_NAMESPACE}
                        kubectl apply -f monitoring/grafana-dashboard.yaml -n ${KUBERNETES_NAMESPACE}
                    """
                }
            }
        }
    }
    
    post {
        always {
            // Clean workspace
            cleanWs()
            
            // Generate test reports
            junit '**/test-results.xml'
            
            // Archive artifacts
            archiveArtifacts artifacts: '**/test-results.xml, zap-report.html', allowEmptyArchive: true
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
            // Send notification on failure
            emailext (
                subject: "Pipeline Failed: ${currentBuild.fullDisplayName}",
                body: "Pipeline failed. Please check the build logs.",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
        }
    }
} 