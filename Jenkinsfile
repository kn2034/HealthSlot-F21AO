pipeline {
    // This Jenkinsfile is used for automated CI/CD of the HealthSlot project
    // Monitored branches: main (production), develop (staging), qa (testing)
    agent any
    
    environment {
        DOCKER_IMAGE = 'healthslot'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS = 'docker-hub-credentials'
        KUBECONFIG_CREDENTIALS = 'kubeconfig-credentials'
        JIRA_SITE = 'healthslot-jira'
        MONGODB_URI_DEV = credentials('mongodb-uri-dev')
        MONGODB_URI_STAGING = credentials('mongodb-uri-staging')
        MONGODB_URI_PROD = credentials('mongodb-uri-prod')
        JWT_SECRET = credentials('jwt-secret')
        STAGING_SERVER = credentials('staging-server')
        PRODUCTION_SERVER = credentials('production-server')
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
                withKubeConfig([credentialsId: KUBECONFIG_CREDENTIALS]) {
                    sh """
                        # Apply configurations in order
                        kubectl apply -f k8s/namespaces.yaml
                        kubectl apply -f k8s/configmap.yaml
                        kubectl apply -f k8s/mongodb.yaml
                        kubectl apply -f k8s/staging-deployment.yaml
                        
                        # Update image
                        kubectl set image deployment/healthslot healthslot=${DOCKER_IMAGE}:${DOCKER_TAG} -n staging
                        
                        # Wait for rollout with timeout
                        kubectl rollout status deployment/healthslot -n staging --timeout=300s
                        
                        # Verify deployment
                        kubectl get pods -n staging -l app=healthslot
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input message: 'Approve deployment to production?'
                }
                withKubeConfig([credentialsId: KUBECONFIG_CREDENTIALS]) {
                    sh """
                        # Apply configurations in order
                        kubectl apply -f k8s/namespaces.yaml
                        kubectl apply -f k8s/production/configmap.yaml
                        kubectl apply -f k8s/production/network-policies.yaml
                        kubectl apply -f k8s/production/mongodb.yaml
                        kubectl apply -f k8s/production/app-deployment.yaml
                        kubectl apply -f k8s/production/hpa.yaml
                        
                        # Update image
                        kubectl set image deployment/healthslot-production healthslot=${DOCKER_IMAGE}:${DOCKER_TAG} -n production
                        
                        # Wait for rollout
                        kubectl rollout status deployment/healthslot-production -n production
                    """
                }
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
                withKubeConfig([credentialsId: KUBECONFIG_CREDENTIALS]) {
                    sh """
                        # Create monitoring namespace if not exists
                        kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
                        
                        # Apply monitoring configurations
                        kubectl apply -f k8s/monitoring/service-monitor.yaml
                    """
                }
            }
        }
    }
    
    post {
        success {
            script {
                if (env.BRANCH_NAME == 'staging' || env.BRANCH_NAME == 'main') {
                    jiraSendBuildInfo site: JIRA_SITE, branch: env.BRANCH_NAME
                }
            }
        }
        failure {
            script {
                if (env.BRANCH_NAME == 'staging' || env.BRANCH_NAME == 'main') {
                    jiraSendBuildInfo site: JIRA_SITE, branch: env.BRANCH_NAME
                }
            }
            emailext (
                subject: "Pipeline Failed: ${currentBuild.fullDisplayName}",
                body: "Pipeline failed at stage: ${env.STAGE_NAME}",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
        }
        always {
            cleanWs()
        }
    }
} 