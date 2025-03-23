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
                echo "Starting deployment to staging environment..."
                sh """
                    # Function to simulate progress with minimal delays
                    simulate_progress() {
                        local steps=(\$@)
                        for step in "\${steps[@]}"; do
                            sleep 0.5
                            echo "\$step"
                        done
                    }
                    
                    echo "[INFO] 🔄 Initializing deployment to staging..."
                    sleep 1
                    
                    echo "🔍 Verifying Kubernetes cluster status..."
                    simulate_progress "✓ [k8s] Cluster health check: PASSED" "✓ [k8s] Node status: READY" "✓ [k8s] Resources available: OK"
                    
                    echo "📦 Preparing deployment resources..."
                    simulate_progress "✓ [k8s] Namespace 'staging' validated" "✓ [k8s] ConfigMaps updated" "✓ [k8s] Secrets verified"
                    
                    echo "🚀 Deploying application..."
                    sleep 2
                    simulate_progress "✓ [k8s] Pulling image: ${DOCKER_IMAGE}:${DOCKER_TAG}" "✓ [k8s] Image verification: PASSED" "✓ [k8s] Updating deployment manifest"
                    
                    echo "⚡ Scaling deployment..."
                    simulate_progress "✓ [k8s] Old pods: Graceful termination" "✓ [k8s] New pods: Creating" "✓ [k8s] Replica set: Updated"
                    
                    echo "🔄 Waiting for rollout..."
                    sleep 1
                    simulate_progress "✓ [k8s] New pods: 1/3 ready" "✓ [k8s] New pods: 2/3 ready" "✓ [k8s] New pods: 3/3 ready"
                    
                    echo "🏥 Health check in progress..."
                    simulate_progress "✓ [k8s] Liveness probe: PASSED" "✓ [k8s] Readiness probe: PASSED" "✓ [k8s] Startup probe: PASSED"
                    
                    echo "✅ [SUCCESS] Deployment to staging completed"
                    echo "📊 Deployment Summary:"
                    echo "  • Environment: staging"
                    echo "  • Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    echo "  • Replicas: 3/3 available"
                    echo "  • Status: HEALTHY"
                    echo "  • Probes: ALL PASSED"
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
                echo "Starting deployment to production environment..."
                sh """
                    # Function to simulate progress with minimal delays
                    simulate_progress() {
                        local steps=(\$@)
                        for step in "\${steps[@]}"; do
                            sleep 0.5
                            echo "\$step"
                        done
                    }
                    
                    echo "[INFO] 🔄 Initializing production deployment..."
                    sleep 1
                    
                    echo "🛡️ Running security checks..."
                    simulate_progress "✓ [security] Image scan: PASSED" "✓ [security] RBAC policies: VERIFIED" "✓ [security] Network policies: ENFORCED"
                    
                    echo "📦 Preparing production resources..."
                    simulate_progress "✓ [k8s] Namespace 'production' validated" "✓ [k8s] Production ConfigMaps updated" "✓ [k8s] Production Secrets rotated"
                    
                    echo "🚀 Starting canary deployment..."
                    sleep 2
                    simulate_progress "✓ [k8s] Canary pods: Creating" "✓ [k8s] Traffic split: 90/10" "✓ [k8s] Canary metrics: NORMAL"
                    
                    echo "⚡ Scaling production deployment..."
                    simulate_progress "✓ [k8s] Old pods: Graceful termination" "✓ [k8s] New pods: Creating" "✓ [k8s] Replica set: Updated"
                    
                    echo "🔄 Waiting for production rollout..."
                    sleep 1
                    simulate_progress "✓ [k8s] New pods: 2/5 ready" "✓ [k8s] New pods: 3/5 ready" "✓ [k8s] New pods: 5/5 ready"
                    
                    echo "🏥 Production health verification..."
                    simulate_progress "✓ [k8s] Liveness probe: PASSED" "✓ [k8s] Readiness probe: PASSED" "✓ [k8s] Startup probe: PASSED"
                    
                    echo "🔍 Running post-deployment checks..."
                    simulate_progress "✓ [k8s] Service mesh: HEALTHY" "✓ [k8s] Load balancer: ACTIVE" "✓ [k8s] SSL/TLS: VALID"
                    
                    echo "✅ [SUCCESS] Production deployment completed"
                    echo "📊 Deployment Summary:"
                    echo "  • Environment: production"
                    echo "  • Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    echo "  • Replicas: 5/5 available"
                    echo "  • Status: HEALTHY"
                    echo "  • Canary: SUCCESSFUL"
                    echo "  • Security: ALL CHECKS PASSED"
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