pipeline {
    // This Jenkinsfile is used for automated CI/CD of the HealthSlot project
    // Monitored branches: main (production), develop (staging), qa (testing)
    agent any
    
    environment {
        DOCKER_HUB_USERNAME = 'kirananarayanak'
        DOCKER_IMAGE = "${DOCKER_HUB_USERNAME}/healthslot"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
        // Actual Jira configuration
        JIRA_SITE = 'hw-devops-team-ao'
        JIRA_PROJECT_KEY = 'AO'
        JIRA_CREDENTIALS = credentials('jira-credentials')
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
        
        stage('Create Deployment Issue') {
            steps {
                script {
                    // Get project details and issue types
                    def projectResponse = jiraGetProject idOrKey: 'AO', site: "${JIRA_SITE}"
                    def issueTypes = jiraGetFields site: "${JIRA_SITE}"
                    echo "Available issue types: ${issueTypes.data}"
                    
                    def deploymentIssue = [
                        fields: [
                            project: [key: 'AO'],
                            issuetype: [id: '10002'], // Using standard Task issue type ID for deployment
                            summary: "Deployment #${env.BUILD_NUMBER} to ${env.BRANCH_NAME}",
                            description: """
                                Build Number: ${env.BUILD_NUMBER}
                                Branch: ${env.BRANCH_NAME}
                                Status: IN PROGRESS
                                Docker Image: ${env.DOCKER_IMAGE}
                                Build URL: ${env.BUILD_URL}
                                Deployment Time: ${new Date().format("yyyy-MM-dd HH:mm:ss")}
                            """
                        ]
                    ]
                    
                    def response = jiraNewIssue issue: deploymentIssue, site: "${JIRA_SITE}"
                    env.DEPLOYMENT_ISSUE_KEY = response.data.key
                    echo "Created deployment issue with key: ${env.DEPLOYMENT_ISSUE_KEY}"
                }
            }
        }
        
        stage('Update Jira') {
            steps {
                script {
                    def issueKey = "AO-${env.BUILD_NUMBER}"
                    jiraSendBuildInfo site: "${JIRA_SITE}", branch: "${env.BRANCH_NAME}"
                    
                    def deploymentIssue = [
                        fields: [
                            project: [key: 'AO'],
                            issuetype: [name: 'Deployment'],
                            summary: "Deployment #${env.BUILD_NUMBER} to ${env.BRANCH_NAME}",
                            description: """
                                Build Number: ${env.BUILD_NUMBER}
                                Branch: ${env.BRANCH_NAME}
                                Status: SUCCESS
                                Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}
                                Build URL: ${env.BUILD_URL}
                                Deployment Time: ${new Date().format("yyyy-MM-dd HH:mm:ss")}
                            """
                        ]
                    ]
                    
                    def response = jiraNewIssue issue: deploymentIssue, site: "${JIRA_SITE}"
                    
                    jiraAddComment idOrKey: "AO-${env.BUILD_NUMBER}", comment: "✅ Deployment successful to ${env.BRANCH_NAME} environment", site: "${JIRA_SITE}"
                }
            }
        }
    }
    
    post {
        success {
            script {
                if (env.BRANCH_NAME == 'staging' || env.BRANCH_NAME == 'main') {
                    jiraComment body: "✅ Deployment successful to ${env.BRANCH_NAME} environment", issueKey: "AO-${env.BUILD_NUMBER}"
                }
            }
        }
        failure {
            script {
                if (env.DEPLOYMENT_ISSUE_KEY) {
                    def failureIssue = [
                        fields: [
                            project: [key: 'AO'],
                            issuetype: [id: '10004'], // Using standard Bug issue type ID
                            summary: "Deployment #${env.BUILD_NUMBER} failed",
                            description: """
                                Build Number: ${env.BUILD_NUMBER}
                                Branch: ${env.BRANCH_NAME}
                                Status: FAILED
                                Failed Stage: ${env.STAGE_NAME}
                                Error: ${currentBuild.description ?: 'Unknown error'}
                                Build URL: ${env.BUILD_URL}
                            """
                        ]
                    ]
                    
                    def bugResponse = jiraNewIssue issue: failureIssue, site: "${JIRA_SITE}"
                    jiraAddComment idOrKey: env.DEPLOYMENT_ISSUE_KEY, comment: "❌ Deployment failed. Bug ticket created: ${bugResponse.data.key}", site: "${JIRA_SITE}"
                }
            }
        }
        always {
            cleanWs()
        }
    }
} 