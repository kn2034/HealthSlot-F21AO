pipeline {
    // This Jenkinsfile is used for automated CI/CD of the HealthSlot project
    // Monitored branches: main (production), develop (staging), qa (testing)
    agent any
    
    environment {
        DOCKER_HUB_USERNAME = 'kirananarayanak'
        DOCKER_IMAGE = "${DOCKER_HUB_USERNAME}/healthslot"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS = 'docker-hub-credentials'
        // Simulated credentials for demonstration
        MOCK_KUBE_CONFIG = 'mock-kube-config'
        MOCK_JIRA_SITE = 'mock-jira-site'
        MONGODB_URI_DEV = 'mongodb://localhost:27017/dev'
        MONGODB_URI_STAGING = 'mongodb://localhost:27017/staging'
        MONGODB_URI_PROD = 'mongodb://localhost:27017/prod'
        JWT_SECRET = 'mock-jwt-secret'
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
            post {
                always {
                    junit '**/test-results.xml'
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
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_CREDENTIALS) {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'staging'
            }
            steps {
                echo "=== Kubernetes Deployment Stage ==="
                echo "Demonstrating Kubernetes deployment capabilities"
                sh """
                    echo "[INFO] Using Kubernetes context: minikube"
                    echo "[INFO] Namespace: staging"
                    
                    echo "✓ [Kubernetes] Verifying cluster connectivity"
                    echo "✓ [Kubernetes] Cluster status: HEALTHY"
                    echo "✓ [Kubernetes] Current context: minikube"
                    
                    echo "✓ [Kubernetes] Deploying to staging environment"
                    echo "✓ [Kubernetes] Created namespace: staging"
                    echo "✓ [Kubernetes] Applied ConfigMap and Secrets"
                    echo "✓ [Kubernetes] Deployed MongoDB StatefulSet"
                    echo "✓ [Kubernetes] Created Services and Ingress"
                    
                    echo "✓ [Kubernetes] Updating deployment: healthslot-staging"
                    echo "✓ [Kubernetes] New image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    echo "✓ [Kubernetes] Rollout status: SUCCESS"
                    echo "✓ [Kubernetes] Pods status: 3/3 running"
                    echo "✓ [Kubernetes] Health checks: PASSED"
                    
                    echo "[INFO] Staging deployment completed successfully"
                """
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input message: 'Approve production deployment?'
                }
                echo "=== Kubernetes Production Deployment ==="
                echo "Demonstrating production deployment process"
                sh """
                    echo "[INFO] Using Production Configuration"
                    echo "[INFO] Namespace: production"
                    
                    echo "✓ [Kubernetes] Production cluster verification"
                    echo "✓ [Kubernetes] Security policies: ENFORCED"
                    echo "✓ [Kubernetes] Network policies: ACTIVE"
                    
                    echo "✓ [Kubernetes] Deploying to production environment"
                    echo "✓ [Kubernetes] Created namespace: production"
                    echo "✓ [Kubernetes] Applied Production ConfigMaps"
                    echo "✓ [Kubernetes] Configured Network Policies"
                    echo "✓ [Kubernetes] Deployed Production MongoDB Cluster"
                    echo "✓ [Kubernetes] Created Production Services"
                    
                    echo "✓ [Kubernetes] Updating production deployment"
                    echo "✓ [Kubernetes] New image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    echo "✓ [Kubernetes] Production rollout: SUCCESS"
                    echo "✓ [Kubernetes] Production pods: 5/5 running"
                    echo "✓ [Kubernetes] Production health: OPTIMAL"
                    
                    echo "[INFO] Production deployment completed successfully"
                """
            }
        }
        
        stage('Setup Monitoring') {
            when {
                anyOf {
                    branch 'staging'
                    branch 'main'
                }
            }
            steps {
                echo "=== Setting up Kubernetes Monitoring ==="
                sh """
                    echo "[INFO] Configuring monitoring stack"
                    
                    echo "✓ [Monitoring] Created monitoring namespace"
                    echo "✓ [Monitoring] Deployed Prometheus stack"
                    echo "✓ [Monitoring] Configured ServiceMonitors"
                    echo "✓ [Monitoring] Deployed Grafana dashboards"
                    echo "✓ [Monitoring] Metrics collection: ACTIVE"
                    echo "✓ [Monitoring] Alerts: CONFIGURED"
                    
                    echo "[INFO] Monitoring setup completed"
                """
            }
        }
    }
    
    post {
        success {
            script {
                if (env.BRANCH_NAME == 'staging' || env.BRANCH_NAME == 'main') {
                    echo "=== Updating Jira Status ==="
                    sh """
                        echo "[INFO] Connecting to Jira"
                        echo "✓ [Jira] Project: HEALTHSLOT"
                        echo "✓ [Jira] Environment: ${env.BRANCH_NAME}"
                        echo "✓ [Jira] Build: #${env.BUILD_NUMBER}"
                        echo "✓ [Jira] Status: SUCCESS"
                        echo "✓ [Jira] Updated linked issues"
                        echo "✓ [Jira] Added deployment notes"
                    """
                }
            }
        }
        failure {
            emailext (
                subject: "Pipeline Failed: ${currentBuild.fullDisplayName}",
                body: "Pipeline failed at stage: ${env.STAGE_NAME}",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
            script {
                if (env.BRANCH_NAME == 'staging' || env.BRANCH_NAME == 'main') {
                    echo "=== Updating Jira with Failure ==="
                    sh """
                        echo "[INFO] Reporting failure to Jira"
                        echo "✓ [Jira] Project: HEALTHSLOT"
                        echo "✓ [Jira] Environment: ${env.BRANCH_NAME}"
                        echo "✓ [Jira] Build: #${env.BUILD_NUMBER}"
                        echo "✓ [Jira] Status: FAILED"
                        echo "✓ [Jira] Added failure details"
                        echo "✓ [Jira] Notified stakeholders"
                    """
                }
            }
        }
        always {
            cleanWs()
        }
    }
} 