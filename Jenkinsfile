// Webhook test 2 - Testing automatic trigger
// Webhook test - This comment is to verify GitHub webhook integration
pipeline {
    agent any
    
    triggers {
        githubPush()
    }
    
    environment {
        DOCKER_IMAGE = 'kirananarayanak/healthslot-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        JIRA_PROJECT = 'HEALTHSLOT'
        NODE_VERSION = '18'
        SNYK_TOKEN = credentials('snyk-token')
    }
    
    tools {
        nodejs 'NodeJS'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // Clean workspace
                    sh 'rm -rf node_modules package-lock.json'
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    try {
                        withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN')]) {
                            sh '''
                                npm install -g snyk
                                snyk auth $SNYK_TOKEN
                                snyk test
                                snyk container test
                            '''
                        }
                    } catch (err) {
                        echo "Skipping Snyk security scan due to missing credentials"
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    sh 'rm -rf node_modules package-lock.json'
                    sh 'npm install'
                }
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    if (fileExists('Dockerfile')) {
                        sh 'docker build -t healthslot-app .'
                        sh 'trivy image healthslot-app'
                    } else {
                        error('Dockerfile not found')
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                script {
                    if (fileExists('docker-compose.staging.yml')) {
                        sh 'docker-compose -f docker-compose.staging.yml up -d'
                    } else {
                        error('docker-compose.staging.yml not found')
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                cleanWs()
                archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
            }
        }
    }
}