pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'healthslot-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        KUBERNETES_NAMESPACE = 'healthslot'
        GITHUB_CREDENTIALS_ID = 'github-credentials'
        DOCKER_CREDENTIALS_ID = 'docker-credentials'
        JIRA_PROJECT_KEY = 'HEALTH'
    }
    
    triggers {
        githubPush()
    }
    
    options {
        timestamps()
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    // Clean workspace before build
                    cleanWs()
                    // Checkout code from GitHub
                    checkout scm
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Unit Tests') {
                    steps {
                        sh 'npm test'
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    // Run security scanning script
                    sh '''
                        chmod +x security/security-scan.sh
                        ./security/security-scan.sh
                    '''
                    
                    // OWASP Dependency Check
                    sh 'npm audit'
                    
                    // Container security scan
                    sh '''
                        docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy image ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Build Docker image
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    
                    // Tag as latest
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }
        
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_CREDENTIALS_ID) {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:latest").push()
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Update Kubernetes deployment
                    sh """
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/deployment.yaml -n ${KUBERNETES_NAMESPACE}
                        kubectl apply -f k8s/service.yaml -n ${KUBERNETES_NAMESPACE}
                        kubectl apply -f security/security-policy.yaml -n ${KUBERNETES_NAMESPACE}
                    """
                    
                    // Wait for deployment to complete
                    sh """
                        kubectl rollout status deployment/healthslot-app -n ${KUBERNETES_NAMESPACE}
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
        
        stage('Integration Tests') {
            steps {
                script {
                    // Wait for service to be ready
                    sh 'sleep 30'
                    
                    // Run integration tests
                    sh '''
                        curl -f http://localhost:3000/health || exit 1
                        curl -f http://localhost:3000/ready || exit 1
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Clean up resources
            cleanWs()
            sh 'docker system prune -f'
        }
        
        success {
            script {
                // Update JIRA ticket status
                jiraTransitionIssue(
                    idOrKey: "${JIRA_PROJECT_KEY}-${BUILD_NUMBER}",
                    input: [
                        transition: [
                            id: '31'
                        ]
                    ]
                )
                
                // Send success notification
                emailext (
                    subject: "Pipeline Successful: ${currentBuild.fullDisplayName}",
                    body: "The pipeline completed successfully.",
                    recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                )
            }
        }
        
        failure {
            script {
                // Update JIRA ticket status
                jiraTransitionIssue(
                    idOrKey: "${JIRA_PROJECT_KEY}-${BUILD_NUMBER}",
                    input: [
                        transition: [
                            id: '41'
                        ]
                    ]
                )
                
                // Send failure notification
                emailext (
                    subject: "Pipeline Failed: ${currentBuild.fullDisplayName}",
                    body: "The pipeline failed. Please check the logs.",
                    recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                )
            }
        }
    }
} 